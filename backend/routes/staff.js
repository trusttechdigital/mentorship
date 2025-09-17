// backend/routes/staff.js -- Routes for managing staff members and their associated user accounts
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { sequelize, Staff, User, Mentee } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');
const bcrypt = require('bcryptjs');

const router = express.Router();

// --- Helper function to generate a random password ---
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// --- Get all staff ---
router.get('/', auth, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const whereClause = search ? {
      [require('sequelize').Op.or]: [
        { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ],
    } : {};

    const staffMembers = await Staff.findAll({
      where: whereClause,
      include: [
        { model: Mentee, as: 'mentees', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'userAccount', attributes: ['id', 'email', 'role', 'isActive', 'lastLogin'] }
      ],
      order: [['firstName', 'ASC']],
    });

    res.json({ staff: staffMembers });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Get a single staff member ---
router.get('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [
        { model: Mentee, as: 'mentees' },
        { model: User, as: 'userAccount', attributes: { exclude: ['password'] } }
      ]
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ staff });
  } catch (error) {
    console.error(`Error fetching staff ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Create a new staff member (and associated user account) ---
router.post('/', [
    auth,
    authorize(['admin']),
    auditLog('CREATE', 'staff'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['admin', 'coordinator', 'mentor']).withMessage('Invalid role'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, ...staffData } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // Check if user already exists
        let existingUser = await User.findOne({ where: { email } });
        
        if (existingUser) {
            // Check if this user already has a staff profile
            const existingStaff = await Staff.findOne({ where: { userId: existingUser.id } });
            
            if (existingStaff) {
                await transaction.rollback();
                return res.status(400).json({ 
                    message: 'This user already has a staff profile.',
                    existingStaff: {
                        firstName: existingStaff.firstName,
                        lastName: existingStaff.lastName,
                        role: existingStaff.role
                    }
                });
            }

            // FIXED: Preserve admin role - don't downgrade existing admins
            const shouldUpdateUserRole = existingUser.role !== 'admin' && existingUser.role !== role;
            
            if (shouldUpdateUserRole) {
                console.log(`[INFO] Updating existing user ${email} role from ${existingUser.role} to ${role}`);
                await existingUser.update({
                    role,
                    firstName: firstName || existingUser.firstName,
                    lastName: lastName || existingUser.lastName
                }, { transaction });
            } else if (existingUser.role === 'admin') {
                console.log(`[INFO] Preserving admin role for ${email}, staff role will be ${role}`);
                // Update name if provided, but keep admin role
                await existingUser.update({
                    firstName: firstName || existingUser.firstName,
                    lastName: lastName || existingUser.lastName
                    // role stays as 'admin' - don't change it!
                }, { transaction });
            }

            // Create staff profile for existing user
            const staff = await Staff.create({
                ...staffData,
                userId: existingUser.id,
                email,
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                role, // The staff role can be different from user role
            }, { transaction });

            await transaction.commit();
            
            return res.status(201).json({ 
                message: existingUser.role === 'admin' 
                    ? 'Staff profile created for admin user (admin privileges preserved).'
                    : 'Staff profile created for existing user successfully.',
                staff,
                note: existingUser.role === 'admin' 
                    ? 'Admin role preserved - you can still manage all staff.'
                    : 'Linked to existing user account - no new login credentials created.'
            });
        }

        // Original logic for new users (unchanged)
        const tempPassword = generateRandomPassword();
        
        // 1. Create User
        const user = await User.create({
            email,
            password: tempPassword,
            firstName,
            lastName,
            role,
        }, { transaction });

        // 2. Create Staff profile
        const staff = await Staff.create({
            ...staffData,
            userId: user.id,
            email,
            firstName,
            lastName,
            role,
        }, { transaction });

        await transaction.commit();
        
        res.status(201).json({ 
            message: 'Staff member and user account created successfully.',
            staff,
            tempPassword, // Only for new users
            note: 'New user account created - temporary password provided.'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating staff member:', error);
        res.status(500).json({ message: 'Failed to create staff member.' });
    }
});

// --- Update a staff member ---
router.put('/:id', [
    auth,
    authorize(['admin']),
    auditLog('UPDATE', 'staff'),
    param('id').isUUID().withMessage('Invalid staff ID format')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, firstName, lastName, role, ...staffData } = req.body;
    
    console.log(`[DEBUG] Updating staff with ID: ${id}`);
    console.log(`[DEBUG] Request body:`, req.body);
    
    const transaction = await sequelize.transaction();

    try {
        // First, check if staff exists
        const staffExists = await Staff.findByPk(id);
        if (!staffExists) {
            console.log(`[ERROR] Staff member with ID ${id} not found in database`);
            return res.status(404).json({ 
                message: 'Staff member not found.',
                requestedId: id,
                debug: 'Staff record does not exist in database'
            });
        }

        const staff = await Staff.findByPk(id, { transaction });
        if (!staff) {
            await transaction.rollback();
            console.log(`[ERROR] Staff member with ID ${id} not found in transaction`);
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        console.log(`[DEBUG] Found staff: ${staff.firstName} ${staff.lastName} (ID: ${staff.id})`);

        const user = await User.findByPk(staff.userId, { transaction });
        if (!user) {
            await transaction.rollback();
            console.log(`[ERROR] Associated user account not found for staff ID ${id}`);
            return res.status(404).json({ message: 'Associated user account not found.' });
        }

        console.log(`[DEBUG] Found associated user: ${user.email} (ID: ${user.id})`);

        // FIXED: Preserve admin role during updates too!
        const shouldUpdateUserRole = user.role !== 'admin' && user.role !== role;
        
        if (shouldUpdateUserRole) {
            console.log(`[INFO] Updating user ${user.email} role from ${user.role} to ${role}`);
            // Update User model including role change
            await user.update({
                email,
                firstName,
                lastName,
                role,
                isActive: staffData.isActive ?? user.isActive
            }, { transaction });
        } else if (user.role === 'admin') {
            console.log(`[INFO] Preserving admin role for ${user.email} during staff update`);
            // Update User model but preserve admin role
            await user.update({
                email,
                firstName,
                lastName,
                // role stays as 'admin' - don't change it!
                isActive: staffData.isActive ?? user.isActive
            }, { transaction });
        } else {
            // Regular update for non-admin users
            await user.update({
                email,
                firstName,
                lastName,
                role,
                isActive: staffData.isActive ?? user.isActive
            }, { transaction });
        }

        // Update Staff model (staff role can be different from user role)
        await staff.update({
            ...staffData,
            email,
            firstName,
            lastName,
            role
        }, { transaction });

        await transaction.commit();

        const updatedStaff = await Staff.findByPk(id, { 
            include: [
                { model: User, as: 'userAccount', attributes: { exclude: ['password'] } }
            ]
        });

        console.log(`[SUCCESS] Staff member ${id} updated successfully`);

        res.json({ 
            message: user.role === 'admin' 
                ? 'Staff member updated successfully (admin privileges preserved).'
                : 'Staff member updated successfully.', 
            staff: updatedStaff 
        });

    } catch (error) {
        await transaction.rollback();
        console.error(`[ERROR] Failed to update staff ${id}:`, error);
        res.status(500).json({ 
            message: 'Failed to update staff member.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// --- Delete a staff member ---
router.delete('/:id', [
    auth,
    authorize(['admin']),
    auditLog('DELETE', 'staff')
], async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();
    try {
        const staff = await Staff.findByPk(id, { transaction });
        if (!staff) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Staff member not found' });
        }

        // Delete staff record
        await staff.destroy({ transaction });

        // Also delete the associated user account
        if (staff.userId) {
            await User.destroy({ where: { id: staff.userId }, transaction });
        }

        await transaction.commit();
        res.json({ message: 'Staff member and associated user account deleted successfully.' });
    } catch (error) {
        await transaction.rollback();
        console.error(`Error deleting staff ${id}:`, error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Set/Reset a staff member's password ---
router.put('/:id/set-password', [
    auth,
    authorize(['admin']),
    auditLog('SET_PASSWORD', 'staff'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const staff = await Staff.findByPk(req.params.id);
        if (!staff || !staff.userId) {
            return res.status(404).json({ message: 'Staff member or associated user account not found.' });
        }

        const user = await User.findByPk(staff.userId);
        if (!user) {
            return res.status(404).json({ message: 'User account not found.' });
        }

        // Hash the password properly
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Update the USER password (this is what login uses)
        await user.update({ password: hashedPassword });

        res.json({ message: `Password for ${user.firstName} ${user.lastName} has been updated.` });

    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ message: 'Server error during password update.' });
    }
});

module.exports = router;