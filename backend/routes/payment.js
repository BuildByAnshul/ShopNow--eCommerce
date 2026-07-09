const express = require('express');
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
// Webhook does not require auth (called by Razorpay servers)
router.post('/webhook', handleWebhook);

module.exports = router;
