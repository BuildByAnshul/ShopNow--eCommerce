const express = require('express');
const router = express.Router();
const { trackVisit, getAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

router.post('/visit', trackVisit);
router.get('/', protect, admin, getAnalytics);

module.exports = router;
