const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category slug'],
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    scale: {
      type: String,
      enum: ['1:64', '1:43', '1:32', '1:24', '1:18', '1:12', ''],
      default: '1:64',
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for category-based queries
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
