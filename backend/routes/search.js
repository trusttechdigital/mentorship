const express = require('express');
const { sequelize, Mentee, Staff, Document, Invoice, Receipt, Inventory } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Global search route
router.get('/', auth, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const lowerCaseQuery = `%${q.toLowerCase()}%`;

    const searchPromises = [
      // Search for mentees
      Mentee.findAll({
        where: {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('firstName')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('lastName')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('hypeId')), { [Op.like]: lowerCaseQuery })
          ]
        },
        limit: 10,
        raw: true,
      }).then(items => items.map(item => ({ ...item, type: 'mentee' }))),

      // Search for staff
      Staff.findAll({
        where: {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('firstName')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('lastName')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), { [Op.like]: lowerCaseQuery })
          ]
        },
        limit: 10,
        raw: true,
      }).then(items => items.map(item => ({ ...item, type: 'staff' }))),

      // Search for documents
      Document.findAll({
        where: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), { [Op.like]: lowerCaseQuery }),
        limit: 10,
        raw: true,
      }).then(items => items.map(item => ({ ...item, type: 'document' }))),

      // Search for invoices
      Invoice.findAll({
        where: {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('invoiceNumber')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('vendor')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), { [Op.like]: lowerCaseQuery })
          ]
        },
        limit: 10,
        raw: true,
      }).then(items => items.map(item => ({ ...item, type: 'invoice' }))),

      // Search for receipts
      Receipt.findAll({
        where: {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('receiptNumber')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('vendor')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('category')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), { [Op.like]: lowerCaseQuery })
          ]
        },
        limit: 10,
        raw: true,
      }).then(items => items.map(item => ({ ...item, type: 'receipt' }))),

      // Search for inventory
      Inventory.findAll({
        where: {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('itemName')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('category')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('supplier')), { [Op.like]: lowerCaseQuery }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('sku')), { [Op.like]: lowerCaseQuery })
          ]
        },
        limit: 10,
        raw: true,
      }).then(items => items.map(item => ({ ...item, type: 'inventory' }))),
    ];

    const results = (await Promise.all(searchPromises)).flat();

    res.json(results);

  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

module.exports = router;