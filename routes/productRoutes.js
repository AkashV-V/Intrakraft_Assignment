const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ratioEngine = require('../services/GradeRatioEngine');

// @route   GET /api/products
// @desc    Get all products from MongoDB with search & filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, brick, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (brick) {
      filter.brick = brick;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { styleCode: searchRegex },
        { styleName: searchRegex },
        { colourName: searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const bricks = await Product.distinct('brick');

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      bricks: bricks.sort(),
      data: products,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/products/batch
// @desc    Batch insert or update products into MongoDB
// @access  Public
router.post('/batch', async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide an array of products' });
    }

    const bulkOps = products.map((p) => {
      const sortedSizes = ratioEngine.sortSizes(p.sizes || []);
      return {
        updateOne: {
          filter: { productKey: p.productKey || `${p.styleCode}__${p.colourName}` },
          update: {
            $set: {
              productKey: p.productKey || `${p.styleCode}__${p.colourName}`,
              styleCode: p.styleCode,
              styleName: p.styleName,
              colourName: p.colourName || '—',
              brick: p.brick || '—',
              category: p.category || '—',
              vertical: p.vertical || '—',
              department: p.department || '—',
              sleeve: p.sleeve || '—',
              neck: p.neck || '—',
              mrp: Number(p.mrp) || 0,
              sizes: sortedSizes,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Product.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: `Batch processing complete. Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`,
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/products
// @desc    Clear catalogue products from MongoDB
// @access  Public
router.delete('/', async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} products from database`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
