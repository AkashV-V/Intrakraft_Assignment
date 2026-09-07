const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Helper to convert Mongoose map/object to JS object
function mapToObject(map) {
  if (!map) return {};
  if (map instanceof Map) {
    return Object.fromEntries(map);
  }
  return map;
}

// @route   GET /api/cart
// @desc    Get cart items with product details and totals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || 'default_session';
    const items = await CartItem.find({ sessionId }).sort({ createdAt: -1 });

    const productKeys = [...new Set(items.map((i) => i.productKey))];
    const products = await Product.find({ productKey: { $in: productKeys } });
    const productMap = new Map();
    products.forEach((p) => productMap.set(p.productKey, p));

    let totalQty = 0;
    let totalAmount = 0;

    const formattedCart = items.map((item) => {
      const product = productMap.get(item.productKey);
      const sizeQty = mapToObject(item.sizeQty);
      const lineQty = Object.values(sizeQty).reduce((acc, q) => acc + (Number(q) || 0), 0);
      const mrp = Number(product?.mrp) || 0;
      const lineAmount = lineQty * mrp;

      totalQty += lineQty;
      totalAmount += lineAmount;

      return {
        id: item._id,
        productKey: item.productKey,
        grade: item.grade,
        sets: item.sets,
        sizeQty,
        product: product || null,
        lineQty,
        lineAmount,
      };
    });

    res.json({
      success: true,
      count: formattedCart.length,
      totals: {
        lines: formattedCart.length,
        totalQty,
        totalAmount,
      },
      data: formattedCart,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/cart
// @desc    Add single item to cart
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { productKey, grade = 'A', sets = 1, sizeQty = {}, sessionId = 'default_session' } = req.body;

    if (!productKey) {
      return res.status(400).json({ success: false, error: 'productKey is required' });
    }

    const item = await CartItem.create({
      sessionId,
      productKey,
      grade,
      sets,
      sizeQty,
    });

    res.status(201).json({
      success: true,
      data: {
        id: item._id,
        productKey: item.productKey,
        grade: item.grade,
        sets: item.sets,
        sizeQty: mapToObject(item.sizeQty),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/cart/sync
// @desc    Bulk sync client cart array to MongoDB
// @access  Public
router.post('/sync', async (req, res) => {
  try {
    const { cart, sessionId = 'default_session' } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ success: false, error: 'cart must be an array' });
    }

    // Clear existing cart for this session
    await CartItem.deleteMany({ sessionId });

    if (cart.length === 0) {
      return res.json({ success: true, message: 'Cart cleared successfully', data: [] });
    }

    const docs = cart.map((item) => ({
      sessionId,
      productKey: item.productKey,
      grade: item.grade || 'A',
      sets: Number(item.sets) || 1,
      sizeQty: item.sizeQty || {},
    }));

    const inserted = await CartItem.insertMany(docs);

    res.json({
      success: true,
      message: `Synced ${inserted.length} cart items to MongoDB`,
      count: inserted.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/cart/:id
// @desc    Update a cart item in MongoDB
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { grade, sets, sizeQty } = req.body;
    const update = {};

    if (grade) update.grade = grade;
    if (sets !== undefined) update.sets = sets;
    if (sizeQty) update.sizeQty = sizeQty;

    const item = await CartItem.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    res.json({
      success: true,
      data: {
        id: item._id,
        productKey: item.productKey,
        grade: item.grade,
        sets: item.sets,
        sizeQty: mapToObject(item.sizeQty),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/cart/:id
// @desc    Remove cart item
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const item = await CartItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear all cart items
// @access  Public
router.delete('/', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || 'default_session';
    const result = await CartItem.deleteMany({ sessionId });
    res.json({ success: true, message: `Cleared ${result.deletedCount} items from cart` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
