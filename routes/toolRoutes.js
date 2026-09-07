const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const CartItem = require('../models/CartItem');
const GradeRatio = require('../models/GradeRatio');
const User = require('../models/User');
const dbManager = require('../config/db');

// @route   GET /api/tools/db-stats
// @desc    Get database connection stats and collection document counts
// @access  Public
router.get('/db-stats', async (req, res) => {
  try {
    const status = dbManager.getStatus();
    const [productsCount, cartCount, ratiosCount, usersCount] = await Promise.all([
      Product.countDocuments(),
      CartItem.countDocuments(),
      GradeRatio.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      database: status,
      collections: {
        products: productsCount,
        cartItems: cartCount,
        gradeRatios: ratiosCount,
        users: usersCount,
      },
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/tools/seed
// @desc    Seed sample catalogue data into MongoDB
// @access  Public
router.post('/seed', async (req, res) => {
  try {
    const seedProducts = [
      {
        productKey: 'ST-101__Navy',
        styleCode: 'ST-101',
        styleName: 'Classic Oxford Cotton Shirt',
        colourName: 'Navy',
        brick: 'Shirts',
        category: 'Formalwear',
        vertical: 'Apparel',
        department: 'Mens',
        sleeve: 'Full Sleeve',
        neck: 'Collar',
        mrp: 1499,
        sizes: ['S', 'M', 'L', 'XL'],
      },
      {
        productKey: 'ST-101__White',
        styleCode: 'ST-101',
        styleName: 'Classic Oxford Cotton Shirt',
        colourName: 'White',
        brick: 'Shirts',
        category: 'Formalwear',
        vertical: 'Apparel',
        department: 'Mens',
        sleeve: 'Full Sleeve',
        neck: 'Collar',
        mrp: 1499,
        sizes: ['S', 'M', 'L', 'XL'],
      },
      {
        productKey: 'TS-205__Black',
        styleCode: 'TS-205',
        styleName: 'Premium Heavyweight Crew T-Shirt',
        colourName: 'Black',
        brick: 'T-Shirts',
        category: 'Casualwear',
        vertical: 'Apparel',
        department: 'Mens',
        sleeve: 'Half Sleeve',
        neck: 'Round Neck',
        mrp: 799,
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        productKey: 'JN-302__Indigo',
        styleCode: 'JN-302',
        styleName: 'Slim Fit Stretch Denim Jeans',
        colourName: 'Dark Indigo',
        brick: 'Jeans',
        category: 'Bottomwear',
        vertical: 'Apparel',
        department: 'Mens',
        sleeve: '—',
        neck: '—',
        mrp: 2299,
        sizes: ['28', '30', '32', '34', '36'],
      },
      {
        productKey: 'HD-404__Heather Grey',
        styleCode: 'HD-404',
        styleName: 'Fleece Pullover Hoodie',
        colourName: 'Heather Grey',
        brick: 'Sweatshirts',
        category: 'Winterwear',
        vertical: 'Apparel',
        department: 'Unisex',
        sleeve: 'Full Sleeve',
        neck: 'Hooded',
        mrp: 1899,
        sizes: ['S', 'M', 'L', 'XL'],
      },
    ];

    await Product.deleteMany({});
    await Product.insertMany(seedProducts);

    res.json({
      success: true,
      message: 'Successfully seeded sample catalogue data into MongoDB',
      count: seedProducts.length,
      products: seedProducts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/tools/export
// @desc    Export full database backup dump
// @access  Public
router.post('/export', async (req, res) => {
  try {
    const [products, cartItems, gradeRatios] = await Promise.all([
      Product.find().lean(),
      CartItem.find().lean(),
      GradeRatio.find().lean(),
    ]);

    res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      data: {
        products,
        cartItems,
        gradeRatios,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
