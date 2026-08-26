const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session'); // Session tracking model

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // --- Active Session Check ---
    const session = await Session.findOne({ token, isActive: true });
    if (!session) {
      return res.status(401).json({ message: 'Session expired or logged out' });
    }

    // Update lastActive timestamp asynchronously (fire and forget, non-blocking)
    Session.updateOne({ _id: session._id }, { lastActive: new Date() }).exec();

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
