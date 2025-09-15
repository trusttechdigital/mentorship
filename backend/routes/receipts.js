const express = require('express');
const { body, validationResult } = require('express-validator');
const { Receipt, User, ReceiptItem } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

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
      include: [
        { model: User, as: 'uploader', attributes: ['firstName', 'lastName'] },
        { model: ReceiptItem, as: 'lineItems' }
      ],
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

// Create a new receipt
router.post('/', [
  auth,
  auditLog('CREATE', 'receipt'),
  body('vendor').trim().notEmpty(),
  body('date').isISO8601(),
  body('category').notEmpty(),
  body('lineItems').isArray({ min: 1 }),
  body('lineItems.*.description').notEmpty(),
  body('lineItems.*.quantity').isInt({ min: 1 }),
  body('lineItems.*.unitPrice').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vendor, date, category, lineItems, subtotal, vat, total } = req.body;

    const receipt = await Receipt.create({
      vendor,
      date,
      category,
      subtotal,
      vat,
      total,
      receiptNumber: `RCP-${Date.now()}`,
      uploadedBy: req.user.id,
      status: 'pending'
    });

    for (const item of lineItems) {
      await ReceiptItem.create({
        ...item,
        receiptId: receipt.id
      });
    }

    const fullReceipt = await Receipt.findByPk(receipt.id, {
      include: [
        { model: User, as: 'uploader', attributes: ['firstName', 'lastName'] },
        { model: ReceiptItem, as: 'lineItems' }
      ]
    });

    res.status(201).json(fullReceipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a receipt
router.put('/:id', [
  auth,
  auditLog('UPDATE', 'receipt'),
  body('vendor').trim().notEmpty(),
  body('date').isISO8601(),
  body('category').notEmpty(),
  body('lineItems').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vendor, date, category, lineItems, subtotal, vat, total } = req.body;
    const receipt = await Receipt.findByPk(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    await receipt.update({ vendor, date, category, subtotal, vat, total });

    await ReceiptItem.destroy({ where: { receiptId: receipt.id } });
    for (const item of lineItems) {
      await ReceiptItem.create({ ...item, receiptId: receipt.id });
    }

    const fullReceipt = await Receipt.findByPk(receipt.id, {
        include: [
            { model: User, as: 'uploader', attributes: ['firstName', 'lastName'] },
            { model: ReceiptItem, as: 'lineItems' }
        ]
    });

    res.json(fullReceipt);
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
