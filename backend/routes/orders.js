const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  checkPurchase,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/check-purchase/:productId', protect, checkPurchase);
router.get('/admin', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, adminOnly, updateOrderStatus);

module.exports = router;
