const express = require('express');
const router = express.Router();
const { Notification } = require('../../../models');
const auth = require('../../../middleware/auth');

// @route   PATCH /api/notifications/all/read
// @desc    Mark all notifications as read
// @access  Private
router.patch('/', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
