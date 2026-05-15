const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// GET /api/users/me/stats
router.get('/me/stats', async (req, res) => {
  const Document = require('../models/Document');
  const ChatSession = require('../models/ChatSession');

  const [docCount, chatCount, user] = await Promise.all([
    Document.countDocuments({ owner: req.user._id }),
    ChatSession.countDocuments({ owner: req.user._id }),
    User.findById(req.user._id),
  ]);

  res.json({
    success: true,
    data: {
      documents: docCount,
      chatSessions: chatCount,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      storagePercent: Math.round((user.storageUsed / user.storageLimit) * 100),
    },
  });
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name } },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: { user } });
});

// PATCH /api/users/me/password
router.patch('/me/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Admin: list users
router.get('/', restrictTo('admin'), async (req, res) => {
  const users = await User.find().select('-refreshTokens').sort({ createdAt: -1 });
  res.json({ success: true, data: { users } });
});

module.exports = router;
