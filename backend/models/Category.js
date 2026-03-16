const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
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

// Auto-generate slug from name before save
const toSlug = (str) => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-');

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = toSlug(this.name);
  }
  next();
});

categorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = toSlug(update.name);
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
