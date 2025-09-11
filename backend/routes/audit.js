// routes/audit.js
const express = require('express');
const { AuditLog, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get audit logs (admin only)
router.get('/', [auth, authorize(['admin'])], async (req, res) => {
  try {
    const { page = 1, limit = 50, action = '', resource = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (action) whereClause.action = action;
    if (resource) whereClause.resource = resource;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      logs: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;