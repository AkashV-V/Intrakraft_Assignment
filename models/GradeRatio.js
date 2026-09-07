const mongoose = require('mongoose');

const GradeRatioSchema = new mongoose.Schema(
  {
    ratioLevel: {
      type: String,
      required: true,
      enum: ['Brick', 'Category', 'Brick + Neck', 'Brick + Sleeve', 'Brick + Category'],
    },
    groupKey: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D'],
    },
    ratios: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Unique rule per ratioLevel + groupKey + grade combination
GradeRatioSchema.index({ ratioLevel: 1, groupKey: 1, grade: 1 }, { unique: true });

module.exports = mongoose.model('GradeRatio', GradeRatioSchema);
