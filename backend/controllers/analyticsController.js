const SiteAnalytics = require('../models/SiteAnalytics');

// @desc    Track a new visit (guest or registered)
// @route   POST /api/analytics/visit
// @access  Public
const trackVisit = async (req, res, next) => {
  try {
    const { type } = req.body; // 'guest' or 'registered'
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Find analytics document for today
    let analytics = await SiteAnalytics.findOne({ date: today });

    if (!analytics) {
      analytics = new SiteAnalytics({ date: today });
    }

    if (type === 'registered') {
      analytics.registeredVisits += 1;
    } else {
      analytics.guestVisits += 1;
    }

    await analytics.save();

    res.status(200).json({ success: true, message: 'Visit tracked' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all analytics data
// @route   GET /api/analytics
// @access  Admin
const getAnalytics = async (req, res, next) => {
  try {
    // Return last 30 days of analytics, sorted chronologically
    const analytics = await SiteAnalytics.find().sort({ date: 1 }).limit(30);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackVisit,
  getAnalytics,
};
