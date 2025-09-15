
const express = require('express');
const { body, validationResult } = require('express-validator');
const { TherapyNote, Mentee } = require('../models'); 
const { auth } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// --- Get all therapy notes for a specific mentee ---
router.get('/', auth, async (req, res) => {
  try {
    const { menteeId } = req.query;
    if (!menteeId) {
      return res.status(400).json({ message: 'A mentee ID is required.' });
    }

    const notes = await TherapyNote.findAll({
      where: { menteeId },
      order: [['sessionDate', 'DESC']],
      include: [{ model: Mentee, as: 'mentee', attributes: ['firstName', 'lastName'] }],
    });

    res.json({ notes });
  } catch (error) {
    console.error('Error fetching therapy notes:', error);
    res.status(500).json({ message: 'Server error while fetching notes.' });
  }
});

// --- Create a new therapy note ---
router.post('/', [
  auth,
  auditLog('CREATE', 'TherapyNote'),
  body('menteeId').isUUID(),
  body('sessionDate').isISO8601(),
  body('sessionType').notEmpty(),
  body('duration').isInt({ min: 1 }),
  body('therapistName').notEmpty(),
  body('sessionNotes').notEmpty(),
  body('riskLevel').isIn(['low', 'medium', 'high']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const note = await TherapyNote.create(req.body);
    const fullNote = await TherapyNote.findByPk(note.id, {
        include: [{ model: Mentee, as: 'mentee', attributes: ['firstName', 'lastName'] }]
    });
    res.status(201).json(fullNote);
  } catch (error) {
    console.error('Error creating therapy note:', error);
    res.status(500).json({ message: 'Server error during note creation.' });
  }
});

module.exports = router;
