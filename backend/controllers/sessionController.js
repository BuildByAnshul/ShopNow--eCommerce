const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Get all active sessions for current user
// @route   GET /api/sessions
// @access  Protected
const getActiveSessions = async (req, res, next) => {
  try {
    // If admin, can view all active sessions
    if (req.user.role === 'admin') {
      const sessions = await Session.find({ isActive: true })
        .populate('userId', 'name email role')
        .sort({ lastActive: -1 });
      return res.json(sessions);
    }

    // Find active sessions for logged in user
    const sessions = await Session.find({
      userId: req.user._id,
      isActive: true,
    })
      .populate('userId', 'name email role')
      .sort({ lastActive: -1 });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Force logout a specific session
// @route   PATCH /api/sessions/:sessionId/logout
// @access  Protected
const forceLogoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).populate('userId', '_id');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const sessionUserId = session.userId?._id ? session.userId._id.toString() : session.userId?.toString();
    const currentUserId = req.user._id.toString();
    const isSelf = sessionUserId === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to force logout this session' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session force-logged out successfully', session });
  } catch (error) {
    next(error);
  }
};

// @desc    Force logout all active sessions for user
// @route   PATCH /api/sessions/users/:userId/logout-all
// @access  Protected
const logoutAllUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const currentUserId = req.user._id.toString();
    const isSelf = userId === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to logout sessions for this user' });
    }

    await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    res.json({ message: 'All active sessions have been force-logged out' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveSessions,
  forceLogoutSession,
  logoutAllUserSessions,
};
