const express = require('express');
const router = express.Router();
const {
  getActiveSessions,
  forceLogoutSession,
  logoutAllUserSessions,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

// GET /api/sessions - List active sessions for user & their sub-users
router.get('/', protect, getActiveSessions);

// PATCH /api/sessions/:sessionId/logout - Force logout a specific session
router.patch('/:sessionId/logout', protect, forceLogoutSession);

// PATCH /api/sessions/users/:userId/logout-all - Force logout all sessions for a sub-user
router.patch('/users/:userId/logout-all', protect, logoutAllUserSessions);

module.exports = router;
