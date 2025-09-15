const express = require('express');
const { body, validationResult } = require('express-validator');
const { Invoice, User, InvoiceItem } = require('../models');
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
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
        { model: InvoiceItem, as: 'lineItems' }
      ],
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

// Create a new invoice
router.post('/', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('CREATE', 'invoice'),
  body('vendor').trim().notEmpty(),
  body('issueDate').isISO8601(),
  body('dueDate').isISO8601(),
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

    const { vendor, issueDate, dueDate, lineItems, subtotal, vat, total } = req.body;

    const invoice = await Invoice.create({
      vendor,
      issueDate,
      dueDate,
      subtotal,
      vat,
      total,
      invoiceNumber: `INV-${Date.now()}`,
      createdBy: req.user.id,
      status: 'pending'
    });

    for (const item of lineItems) {
      await InvoiceItem.create({
        ...item,
        invoiceId: invoice.id
      });
    }

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
          { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
          { model: InvoiceItem, as: 'lineItems' }
        ]
    });

    res.status(201).json(fullInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an invoice
router.put('/:id', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE', 'invoice'),
  body('vendor').trim().notEmpty(),
  body('issueDate').isISO8601(),
  body('dueDate').isISO8601(),
  body('lineItems').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vendor, issueDate, dueDate, lineItems, subtotal, vat, total } = req.body;
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.update({ vendor, issueDate, dueDate, subtotal, vat, total });

    // Remove old line items and add new ones
    await InvoiceItem.destroy({ where: { invoiceId: invoice.id } });
    for (const item of lineItems) {
      await InvoiceItem.create({ ...item, invoiceId: invoice.id });
    }

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
          { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
          { model: InvoiceItem, as: 'lineItems' }
      ]
    });

    res.json(fullInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update invoice status
router.patch('/:id/status', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE_STATUS', 'invoice'),
  body('status').isIn(['pending', 'paid', 'rejected', 'approved'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status;
    if (status === 'paid') {
        invoice.paidDate = new Date();
    }
    await invoice.save();

    const fullInvoice = await Invoice.findByPk(invoice.id, {
        include: [
            { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
            { model: InvoiceItem, as: 'lineItems' }
        ]
      });

    res.json(fullInvoice);
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
