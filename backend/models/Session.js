const mongoose = require('mongoose');

// Active Login Session Schema
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  ip: {
    type: String,
    default: '',
  },
  device: {
    type: String,
    default: '',
  },
  loginAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: automatically remove session record after 30 days (2,592,000 seconds)
sessionSchema.index({ loginAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Session', sessionSchema);
