
// backend/routes/staff.js
const express = require('express');
const { body, validationResult } = require('express-validator');
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
    const tempPassword = generateRandomPassword();

    const transaction = await sequelize.transaction();

    try {
        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            await transaction.rollback();
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        
        // 1. Create User
        const user = await User.create({
            email,
            password: tempPassword, // User should change this
            firstName,
            lastName,
            role,
        }, { transaction });

        // 2. Create Staff profile
        const staff = await Staff.create({
            ...staffData,
            userId: user.id,
            email, // Ensure email is consistent
            firstName,
            lastName,
            role,
        }, { transaction });

        await transaction.commit();
        
        // TODO: In a real app, you would email this password to the user
        // For now, we return it in the response for testing.
        res.status(201).json({ 
            message: 'Staff member and user account created successfully.',
            staff,
            tempPassword // returning for dev purposes
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
    auditLog('UPDATE', 'staff')
], async (req, res) => {
    const { id } = req.params;
    const { email, firstName, lastName, role, ...staffData } = req.body;
    
    const transaction = await sequelize.transaction();

    try {
        const staff = await Staff.findByPk(id, { transaction });
        if (!staff) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        const user = await User.findByPk(staff.userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Associated user account not found.' });
        }

        // Update User model
        await user.update({
            email,
            firstName,
            lastName,
            role,
            isActive: staffData.isActive // Keep user active status in sync
        }, { transaction });

        // Update Staff model
        await staff.update({
            ...staffData,
            email,
            firstName,
            lastName,
            role
        }, { transaction });

        await transaction.commit();

        const updatedStaff = await Staff.findByPk(id, { include: ['userAccount'] });

        res.json({ message: 'Staff member updated successfully.', staff: updatedStaff });

    } catch (error) {
        await transaction.rollback();
        console.error(`Error updating staff ${id}:`, error);
        res.status(500).json({ message: 'Failed to update staff member.' });
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

        // The password will be hashed by the hook on the User model
        user.password = req.body.password;
        await user.save();

        res.json({ message: `Password for ${user.firstName} ${user.lastName} has been updated.` });

    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ message: 'Server error during password update.' });
    }
});

module.exports = router;
