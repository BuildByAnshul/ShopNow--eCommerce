const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Create new order
// @route POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, address, razorpayOrderId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock and calculate totals
    let itemsTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      });

      itemsTotal += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingCost = itemsTotal >= 999 ? 0 : 99;
    const total = itemsTotal + shippingCost;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      address,
      itemsTotal,
      shippingCost,
      total,
      razorpayOrderId,
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc  Get logged-in user's orders
// @route GET /api/orders/user
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Allow if user owns order or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc  Get all orders (admin)
// @route GET /api/orders/admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc  Update order status (admin)
// @route PUT /api/orders/:id
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc  Check if user purchased a product
// @route GET /api/orders/check-purchase/:productId
const checkPurchase = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.productId,
      paymentStatus: 'paid'
    });

    res.json({ purchased: !!order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, checkPurchase };
