// routes/dashboard.js
const express = require('express');
const { Staff, Mentee, Invoice, Inventory, Receipt, Document } = require('../models');
const { auth } = require('../middleware/auth');
const { col } = require('sequelize');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const [
      totalStaff,
      totalMentees,
      pendingInvoices,
      lowStockItems,
      pendingReceipts,
      totalDocuments
    ] = await Promise.all([
      Staff.count({ where: { isActive: true } }),
      Mentee.count(),
      Invoice.count({ where: { status: 'pending' } }),
      Inventory.count({
        where: {
          isActive: true,
          quantity: { [require('sequelize').Op.lte]: col('minStock') }
        }
      }),
      Receipt.count({ where: { status: 'pending' } }),
      Document.count()
    ]);

    const recentActivity = await Promise.all([
      Mentee.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: Staff, as: 'mentor', attributes: ['firstName', 'lastName'] }],
        attributes: ['firstName', 'lastName', 'createdAt']
      }),
      Document.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['title', 'createdAt']
      }),
      Invoice.findAll({
        where: { status: 'pending' },
        limit: 5,
        order: [['issueDate', 'DESC']],
        attributes: ['vendor', 'total', 'issueDate']
      })
    ]);

    res.json({
      stats: {
        totalStaff,
        totalMentees,
        pendingInvoices,
        lowStockItems,
        pendingReceipts,
        totalDocuments
      },
      recentActivity: {
        newMentees: recentActivity[0],
        newDocuments: recentActivity[1],
        pendingInvoices: recentActivity[2]
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
// routes/dashboard.js