const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    styleCode: {
      type: String,
      required: true,
      index: true,
    },
    styleName: {
      type: String,
      required: true,
      trim: true,
    },
    colourName: {
      type: String,
      default: '—',
    },
    brick: {
      type: String,
      default: '—',
      index: true,
    },
    category: {
      type: String,
      default: '—',
      index: true,
    },
    vertical: {
      type: String,
      default: '—',
    },
    department: {
      type: String,
      default: '—',
    },
    sleeve: {
      type: String,
      default: '—',
    },
    neck: {
      type: String,
      default: '—',
    },
    mrp: {
      type: Number,
      default: 0,
    },
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ styleCode: 'text', styleName: 'text', colourName: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
