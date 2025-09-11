// routes/receipts.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Receipt, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Get all receipts
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const { count, rows } = await Receipt.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'uploader', attributes: ['firstName', 'lastName'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json({
      receipts: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload receipt
router.post('/upload', [
  auth,
  upload.single('receipt'),
  auditLog('UPLOAD', 'receipt')
], async (req, res) => {
  try {
    const { vendor, amount, date, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' });
    }

    const receipt = await Receipt.create({
      receiptNumber: `RCP-${Date.now()}`,
      vendor,
      amount: parseFloat(amount),
      date: new Date(date),
      category,
      description,
      filename: req.file.filename,
      path: req.file.path,
      uploadedBy: req.user.id
    });

    const fullReceipt = await Receipt.findByPk(receipt.id, {
      include: [{ model: User, as: 'uploader', attributes: ['firstName', 'lastName'] }]
    });

    res.status(201).json(fullReceipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject receipt
router.patch('/:id/status', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE_STATUS', 'receipt')
], async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [updated] = await Receipt.update({ status }, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const receipt = await Receipt.findByPk(req.params.id, {
      include: [{ model: User, as: 'uploader', attributes: ['firstName', 'lastName'] }]
    });

    res.json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;