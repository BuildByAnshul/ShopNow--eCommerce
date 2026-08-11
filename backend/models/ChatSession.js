const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null means anonymous user
    },
    sessionId: {
      type: String,
      // Used to track anonymous users
    },
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: true,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        content: { type: String, required: true },
        products: [
          {
            id: { type: String },
            name: { type: String },
            price: { type: Number },
            image: { type: String }
          }
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Create compound index for querying limits by date
chatSessionSchema.index({ userId: 1, date: 1 });
chatSessionSchema.index({ sessionId: 1, date: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
