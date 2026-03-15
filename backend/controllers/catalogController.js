const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('-__v');

    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select('-__v');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all active products (with filters, search, sort)
// @route   GET /api/products?category=hotwheels&search=porsche&sort=price_asc&minPrice=100&maxPrice=500&inStock=true&onSale=true&scale=1:64&material=diecast
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    // Text search (name)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // In stock only
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // On sale only (has discount)
    if (req.query.onSale === 'true') {
      filter.discount = { $gt: 0 };
    }

    // Scale filter (comma-separated)
    if (req.query.scale) {
      const scales = req.query.scale.split(',').map((s) => s.trim());
      filter.scale = { $in: scales };
    }

    // Sort options
    let sort = { createdAt: -1 }; // default: newest
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'name_desc':
        sort = { name: -1 };
        break;
      case 'discount':
        sort = { discount: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .select('-__v');

    // Also return available filter options (distinct values) for the current category scope
    const scopeFilter = { isActive: true };
    if (req.query.category) scopeFilter.category = req.query.category.toLowerCase();

    const [scales, priceStats] = await Promise.all([
      Product.distinct('scale', scopeFilter),
      Product.aggregate([
        { $match: scopeFilter },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
    ]);

    res.json({
      success: true,
      count: products.length,
      data: products,
      filterOptions: {
        scales: scales.filter(Boolean).sort(),
        priceRange: priceStats[0] ? { min: priceStats[0].min, max: priceStats[0].max } : { min: 0, max: 0 },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
