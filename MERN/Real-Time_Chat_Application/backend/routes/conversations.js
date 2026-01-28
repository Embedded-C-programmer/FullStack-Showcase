const express = require('express');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Get all conversations for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', '-password')
    .populate('lastMessage')
    .populate('admin', '-password')
    .sort({ lastMessageAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single conversation
router.get('/:id', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    })
    .populate('participants', '-password')
    .populate('admin', '-password');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or get private conversation
router.post('/private',
  authenticate,
  [body('userId').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.body;

      if (userId === req.user._id.toString()) {
        return res.status(400).json({ error: 'Cannot create conversation with yourself' });
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        type: 'private',
        participants: { $all: [req.user._id, userId], $size: 2 }
      })
      .populate('participants', '-password')
      .populate('lastMessage');

      if (conversation) {
        return res.json({ conversation, isNew: false });
      }

      // Create new conversation
      conversation = new Conversation({
        type: 'private',
        participants: [req.user._id, userId]
      });

      await conversation.save();
      await conversation.populate('participants', '-password');

      res.status(201).json({ conversation, isNew: true });
    } catch (error) {
      console.error('Create private conversation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Create group conversation
router.post('/group',
  authenticate,
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('participantIds').isArray({ min: 2 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, participantIds } = req.body;

      // Ensure current user is included
      const allParticipants = [
        req.user._id,
        ...participantIds.filter(id => id !== req.user._id.toString())
      ];

      const conversation = new Conversation({
        type: 'group',
        name,
        participants: allParticipants,
        admin: req.user._id,
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`
      });

      await conversation.save();
      await conversation.populate('participants', '-password');
      await conversation.populate('admin', '-password');

      res.status(201).json({ conversation });
    } catch (error) {
      console.error('Create group conversation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update group conversation
router.patch('/:id',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('avatar').optional().isURL()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const conversation = await Conversation.findOne({
        _id: req.params.id,
        type: 'group',
        admin: req.user._id
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Group not found or unauthorized' });
      }

      if (req.body.name) conversation.name = req.body.name;
      if (req.body.avatar) conversation.avatar = req.body.avatar;

      await conversation.save();
      await conversation.populate('participants', '-password');

      res.json({ conversation });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Add participants to group
router.post('/:id/participants',
  authenticate,
  [body('participantIds').isArray({ min: 1 })],
  async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        type: 'group',
        admin: req.user._id
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Group not found or unauthorized' });
      }

      const newParticipants = req.body.participantIds.filter(
        id => !conversation.participants.includes(id)
      );

      conversation.participants.push(...newParticipants);
      await conversation.save();
      await conversation.populate('participants', '-password');

      res.json({ conversation });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;