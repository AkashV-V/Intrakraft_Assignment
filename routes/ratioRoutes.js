const express = require('express');
const router = express.Router();
const GradeRatio = require('../models/GradeRatio');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ratioEngine = require('../services/GradeRatioEngine');

// Helper
function mapToObject(map) {
  if (!map) return {};
  if (map instanceof Map) return Object.fromEntries(map);
  return map;
}

// @route   GET /api/ratios
// @desc    Get all grade ratio rules
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rules = await GradeRatio.find().sort({ ratioLevel: 1, groupKey: 1, grade: 1 });
    const formatted = rules.map((r) => ({
      id: r._id,
      ratioLevel: r.ratioLevel,
      groupKey: r.groupKey,
      grade: r.grade,
      ratios: mapToObject(r.ratios),
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/ratios
// @desc    Save or update grade ratio rule
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { ratioLevel, groupKey, grade, ratios } = req.body;

    if (!ratioLevel || !groupKey || !grade || !ratios) {
      return res.status(400).json({ success: false, error: 'ratioLevel, groupKey, grade, and ratios are required' });
    }

    const rule = await GradeRatio.findOneAndUpdate(
      { ratioLevel, groupKey, grade },
      { ratioLevel, groupKey, grade, ratios },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: {
        id: rule._id,
        ratioLevel: rule.ratioLevel,
        groupKey: rule.groupKey,
        grade: rule.grade,
        ratios: mapToObject(rule.ratios),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/ratios/apply
// @desc    Apply grade ratios to database cart items
// @access  Public
router.post('/apply', async (req, res) => {
  try {
    const { ratioLevel = 'Brick', ratios = {}, sessionId = 'default_session' } = req.body;

    const cartItems = await CartItem.find({ sessionId });
    if (cartItems.length === 0) {
      return res.json({ success: true, message: 'Cart is empty. No ratios applied.', count: 0 });
    }

    const productKeys = [...new Set(cartItems.map((i) => i.productKey))];
    const products = await Product.find({ productKey: { $in: productKeys } });
    const productMap = new Map();
    products.forEach((p) => productMap.set(p.productKey, p));

    // Also fetch database stored rules to merge if ratio payload is partial
    const storedRules = await GradeRatio.find({ ratioLevel });
    const mergedRatios = { ...ratios };
    storedRules.forEach((rule) => {
      const key = `${ratioLevel}||${rule.groupKey}||${rule.grade}`;
      if (!mergedRatios[key]) {
        mergedRatios[key] = mapToObject(rule.ratios);
      }
    });

    const updatedCart = ratioEngine.applyRatiosToCart(
      cartItems.map((i) => ({
        id: i._id,
        productKey: i.productKey,
        grade: i.grade,
        sets: i.sets,
        sizeQty: mapToObject(i.sizeQty),
      })),
      productMap,
      mergedRatios,
      ratioLevel
    );

    // Save updated size quantities back to MongoDB
    const bulkOps = updatedCart.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sizeQty: item.sizeQty } },
      },
    }));

    if (bulkOps.length > 0) {
      await CartItem.bulkWrite(bulkOps);
    }

    res.json({
      success: true,
      message: `Applied ${ratioLevel} grade ratios across ${updatedCart.length} cart items`,
      count: updatedCart.length,
      data: updatedCart,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
