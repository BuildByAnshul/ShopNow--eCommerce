const mongoose = require('mongoose');

const siteAnalyticsSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    unique: true
  },
  guestVisits: {
    type: Number,
    default: 0
  },
  registeredVisits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteAnalytics', siteAnalyticsSchema);
