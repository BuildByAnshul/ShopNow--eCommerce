const express = require('express');
const { askQuestion, getHistory } = require('../controllers/chatbotController');

const router = express.Router();

router.post('/ask', askQuestion);
router.get('/history', getHistory);

module.exports = router;
