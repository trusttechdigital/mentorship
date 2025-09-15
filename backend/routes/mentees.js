// routes/mentees.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Mentee, Staff } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');
const { upload, uploadToSpaces } = require('../utils/fileUploader');
const { sequelize } = require('../models'); // Import sequelize for transactions

const router = express.Router();

// Get all mentees
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Mentee.findAndCountAll({
      where: whereClause,
      include: [{ model: Staff, as: 'mentor', attributes: ['firstName', 'lastName', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['firstName', 'ASC']]
    });

    res.json({
      mentees: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching mentees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single mentee
router.get('/:id', auth, async (req, res) => {
  try {
    const mentee = await Mentee.findByPk(req.params.id, {
      include: [{ model: Staff, as: 'mentor' }]
    });

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    res.json(mentee);
  } catch (error) {
    console.error(`Error fetching mentee ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create mentee
router.post('/', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('CREATE', 'mentee'),
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('A valid email is required.'),
], async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mentee = await Mentee.create(req.body, { transaction: t });
    await t.commit();
    
    const fullMentee = await Mentee.findByPk(mentee.id, {
      include: [{ model: Staff, as: 'mentor' }]
    });
    
    res.status(201).json(fullMentee);
  } catch (error) {
    await t.rollback();
    console.error('Error creating mentee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentee
router.put('/:id', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE', 'mentee')
], async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const mentee = await Mentee.findByPk(req.params.id, { transaction: t });
    if (!mentee) {
      await t.rollback();
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // Fix for empty dateOfBirth
    if (req.body.dateOfBirth === '') {
      req.body.dateOfBirth = null;
    }

    await mentee.update(req.body, { transaction: t });
    await t.commit();

    const updatedMentee = await Mentee.findByPk(req.params.id, {
      include: [{ model: Staff, as: 'mentor' }]
    });
    res.json(updatedMentee);
  } catch (error) {
    await t.rollback();
    console.error(`Error updating mentee ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload mentee photo
router.post('/:id/upload-photo', [
  auth,
  authorize(['admin', 'coordinator']),
  upload.single('photo'),
  auditLog('UPLOAD_PHOTO', 'mentee')
], async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select a photo.' });
    }

    const mentee = await Mentee.findByPk(req.params.id, { transaction: t });
    if (!mentee) {
      await t.rollback();
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // TODO: Delete old photo from Spaces if it exists (mentee.photoFileKey)

    const { fileUrl, fileKey } = await uploadToSpaces(req.file);

    await mentee.update({
      photoUrl: fileUrl,
      photoFileKey: fileKey
    }, { transaction: t });

    await t.commit();

    // Refetch the mentee to include the mentor details in the response
    const updatedMentee = await Mentee.findByPk(mentee.id, {
      include: [{ model: Staff, as: 'mentor' }]
    });

    res.json(updatedMentee);
  } catch (error) {
    await t.rollback();
    console.error(`Error uploading photo for mentee ${req.params.id}:`, error);
    // Send a more specific error message if available
    res.status(500).json({ message: error.message || 'Server error during photo upload.' });
  }
});

// Delete mentee
router.delete('/:id', [
  auth,
  authorize(['admin']),
  auditLog('DELETE', 'mentee')
], async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const mentee = await Mentee.findByPk(req.params.id, { transaction: t });
    if (!mentee) {
      await t.rollback();
      return res.status(404).json({ message: 'Mentee not found' });
    }
    
    // TODO: Delete photo from Spaces before deleting the mentee record

    await mentee.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'Mentee deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error(`Error deleting mentee ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
