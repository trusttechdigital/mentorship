// routes/invoices.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Invoice, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'creator', attributes: ['firstName', 'lastName'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['issueDate', 'DESC']]
    });

    res.json({
      invoices: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invoice
router.post('/', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('CREATE', 'invoice'),
  body('vendor').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('issueDate').isISO8601(),
  body('dueDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoiceData = {
      ...req.body,
      invoiceNumber: `INV-${Date.now()}`,
      createdBy: req.user.id
    };

    const invoice = await Invoice.create(invoiceData);
    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [{ model: User, as: 'creator', attributes: ['firstName', 'lastName'] }]
    });

    res.status(201).json(fullInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark invoice as paid
router.patch('/:id/pay', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('PAY', 'invoice')
], async (req, res) => {
  try {
    const { paymentMethod, paidDate } = req.body;

    const [updated] = await Invoice.update({
      status: 'paid',
      paidDate: paidDate || new Date(),
      paymentMethod
    }, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['firstName', 'lastName'] }]
    });

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;