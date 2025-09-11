// routes/mentees.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Mentee, Staff } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create mentee
router.post('/', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('CREATE', 'mentee'),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('programStartDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mentee = await Mentee.create(req.body);
    const fullMentee = await Mentee.findByPk(mentee.id, {
      include: [{ model: Staff, as: 'mentor' }]
    });
    
    res.status(201).json(fullMentee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentee
router.put('/:id', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE', 'mentee')
], async (req, res) => {
  try {
    const [updated] = await Mentee.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    const mentee = await Mentee.findByPk(req.params.id, {
      include: [{ model: Staff, as: 'mentor' }]
    });
    res.json(mentee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete mentee
router.delete('/:id', [
  auth,
  authorize(['admin']),
  auditLog('DELETE', 'mentee')
], async (req, res) => {
  try {
    const deleted = await Mentee.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    res.json({ message: 'Mentee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
