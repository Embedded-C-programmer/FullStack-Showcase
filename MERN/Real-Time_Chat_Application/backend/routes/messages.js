const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', authenticate, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        // Verify user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const query = {
            conversationId,
            deleted: false
        };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('sender', '-password')
            .lean();

        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark messages as read
router.post('/:conversationId/read', authenticate, async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Verify user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Mark all unread messages as read
        await Message.updateMany(
            {
                conversationId,
                sender: { $ne: req.user._id },
                'readBy.user': { $ne: req.user._id }
            },
            {
                $push: {
                    readBy: {
                        user: req.user._id,
                        readAt: new Date()
                    }
                }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Edit message
router.patch('/:messageId',
    authenticate,
    [body('content').trim().isLength({ min: 1 })],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const message = await Message.findOne({
                _id: req.params.messageId,
                sender: req.user._id,
                deleted: false
            });

            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }

            message.content = req.body.content;
            message.edited = true;
            message.editedAt = new Date();
            await message.save();

            await message.populate('sender', '-password');

            res.json({ message });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Delete message
router.delete('/:messageId', authenticate, async (req, res) => {
    try {
        const message = await Message.findOne({
            _id: req.params.messageId,
            sender: req.user._id
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        message.deleted = true;
        message.content = 'This message has been deleted';
        await message.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;