const Product = require('../models/Product');

// Helper function to build smart search query
const buildSearchQuery = (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return {};

  const term = searchTerm.trim();
  const words = term.split(' ').filter(w => w.length > 0);
  
  // Create multiple query conditions for flexible matching
  const orConditions = [];
  
  // 1. Exact substring match in product name (case insensitive)
  orConditions.push({ name: { $regex: term, $options: 'i' } });
  
  // 2. Individual word matches in product name
  words.forEach(word => {
    if (word.length > 0) {
      orConditions.push({ name: { $regex: word, $options: 'i' } });
    }
  });
  
  // 3. First letter abbreviation (rvc = rose vitamin c)
  if (words.length > 1) {
    const abbrev = words.map(w => w[0]).join('');
    orConditions.push({ name: { $regex: abbrev, $options: 'i' } });
  }
  
  // 4. Also search by category
  const categories = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];
  categories.forEach(cat => {
    if (term.toLowerCase().includes(cat) || cat.includes(term.toLowerCase())) {
      orConditions.push({ category: cat });
    }
  });
  
  return { $or: orConditions };
};

// @desc  Get all products with filtering, search, pagination
// @route GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12, featured } = req.query;

    let query = {};

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    // Use smart search query
    if (search) {
      const searchQuery = buildSearchQuery(search);
      if (Object.keys(searchQuery).length > 0) {
        query = { ...query, ...searchQuery };
      }
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single product
// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc  Create product (admin)
// @route POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc  Update product (admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Add review
// @route POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    // Admins cannot rate products
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot rate products' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Verify user has purchased this product
    const Order = require('../models/Order');
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.id,
      paymentStatus: 'paid'
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.updateRating();
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview };
