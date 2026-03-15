const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Please provide a category slug'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide a category image URL'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
