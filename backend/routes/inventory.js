// Complete routes/inventory.js - Add the missing routes
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Inventory } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', lowStock = false, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { isActive: true };
    
    // Category filter
    if (category) whereClause.category = category;
    
    // Low stock filter
    if (lowStock === 'true') {
      whereClause[require('sequelize').Op.and] = [
        require('sequelize').literal('quantity <= "minStock"')
      ];
    }

    // Search filter
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { itemName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { sku: { [require('sequelize').Op.iLike]: `%${search}%` } }
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
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single inventory item
router.get('/:id', [
  auth,
  param('id').isUUID().withMessage('Invalid inventory ID format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Inventory.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ inventory: item });
  } catch (error) {
    console.error(`Error fetching inventory item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create inventory item
router.post('/', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('CREATE', 'inventory'),
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
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

    res.status(201).json({ 
      message: 'Inventory item created successfully',
      inventory: item 
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory item
router.put('/:id', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE', 'inventory'),
  param('id').isUUID().withMessage('Invalid inventory ID format'),
  body('itemName').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Inventory.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await item.update(req.body);

    const updatedItem = await Inventory.findByPk(req.params.id);

    res.json({ 
      message: 'Inventory item updated successfully',
      inventory: updatedItem 
    });
  } catch (error) {
    console.error(`Error updating inventory item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock quantity
router.patch('/:id/stock', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('UPDATE_STOCK', 'inventory'),
  param('id').isUUID().withMessage('Invalid inventory ID format'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('operation').isIn(['set', 'add', 'subtract']).withMessage('Operation must be set, add, or subtract')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity, operation } = req.body;
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
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
    
    const updatedItem = await Inventory.findByPk(req.params.id);

    res.json({ 
      message: 'Stock updated successfully',
      inventory: updatedItem 
    });
  } catch (error) {
    console.error(`Error updating stock for item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete inventory item
router.delete('/:id', [
  auth,
  authorize(['admin', 'coordinator']),
  auditLog('DELETE', 'inventory'),
  param('id').isUUID().withMessage('Invalid inventory ID format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Inventory.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Soft delete - set isActive to false
    await item.update({ isActive: false });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting inventory item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;