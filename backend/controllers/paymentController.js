const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc  Create Razorpay order
// @route POST /api/payment/create-order
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in INR (rupees)

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const isDemo = process.env.RAZORPAY_KEY_ID.includes('XXXX');
    if (isDemo) {
      return res.json({
        orderId: `order_demo_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify Razorpay payment signature
// @route POST /api/payment/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const isDemo = process.env.RAZORPAY_KEY_ID.includes('XXXX');
    if (!isDemo) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    // Update order in DB
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc  Razorpay webhook handler
// @route POST /api/payment/webhook
const handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Webhook signature mismatch' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const razorpayOrderId = payload.payment.entity.order_id;
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'paid', orderStatus: 'confirmed', paidAt: new Date() }
      );
    }

    if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'failed' }
      );
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };
