const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['private', 'group'],
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    name: {
        type: String,
        trim: true,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Method to get conversation name for private chats
conversationSchema.methods.getDisplayName = function (userId) {
    if (this.type === 'group') {
        return this.name || 'Group Chat';
    }

    // For private chats, return the other participant's name
    const otherParticipant = this.participants.find(
        p => p._id.toString() !== userId.toString()
    );

    return otherParticipant ? otherParticipant.username : 'Unknown User';
};

module.exports = mongoose.model('Conversation', conversationSchema);