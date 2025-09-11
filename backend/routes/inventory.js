// routes/inventory.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Inventory } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', lowStock = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { isActive: true };
    if (category) whereClause.category = category;
    if (lowStock === 'true') {
      whereClause[require('sequelize').Op.and] = [
        require('sequelize').literal('quantity <= "minStock"')
      ];
    }

    const { count, rows } = await Inventory.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['itemName', 'ASC']]
    });

    res.json({
      inventory: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create inventory item
router.post('/', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('CREATE', 'inventory'),
  body('itemName').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('quantity').isInt({ min: 0 }),
  body('minStock').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Inventory.create({
      ...req.body,
      sku: req.body.sku || `SKU-${Date.now()}`
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock quantity
router.patch('/:id/stock', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE_STOCK', 'inventory'),
  body('quantity').isInt({ min: 0 }),
  body('operation').isIn(['set', 'add', 'subtract'])
], async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let newQuantity;
    switch (operation) {
      case 'set':
        newQuantity = quantity;
        break;
      case 'add':
        newQuantity = item.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, item.quantity - quantity);
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await item.update({ quantity: newQuantity });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;