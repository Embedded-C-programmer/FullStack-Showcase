const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sources: [
    {
      chunkIndex: Number,
      content: String,
      score: Number,
      documentId: mongoose.Schema.Types.ObjectId,
    },
  ],
  tokensUsed: Number,
  latencyMs: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
    messages: [messageSchema],
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

chatSessionSchema.index({ owner: 1, document: 1, createdAt: -1 });

// Auto-update message count and lastMessageAt
chatSessionSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.messageCount = this.messages.length;
    if (this.messages.length > 0) {
      this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
    }
  }
  next();
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
