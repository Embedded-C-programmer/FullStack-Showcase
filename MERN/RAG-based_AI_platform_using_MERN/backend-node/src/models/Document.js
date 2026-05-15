const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  chunkIndex: Number,
  content: String,
  tokenCount: Number,
  embedding: { type: Boolean, default: false }, // whether embedded in FAISS
});

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: String,
    mimeType: String,
    fileSize: Number, // bytes
    filePath: String,
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading',
    },
    processingError: String,
    pageCount: Number,
    wordCount: Number,
    chunkCount: Number,
    chunks: [chunkSchema],
    tags: [{ type: String, trim: true }],
    metadata: {
      type: Map,
      of: String,
    },
    faissIndexId: String,     // reference in the Python FAISS service
    lastIndexedAt: Date,
    chatCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

documentSchema.index({ owner: 1, status: 1 });
documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ owner: 1, tags: 1 });

module.exports = mongoose.model('Document', documentSchema);
