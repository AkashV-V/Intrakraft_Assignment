const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    sessionId: {
      type: String,
      default: 'default_session',
      index: true,
    },
    productKey: {
      type: String,
      required: true,
      index: true,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'A',
    },
    sets: {
      type: Number,
      default: 1,
      min: 0,
    },
    sizeQty: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CartItem', CartItemSchema);
