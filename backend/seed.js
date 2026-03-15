/**
 * Seed script — populates the database with initial categories and products.
 *
 * Usage:  node seed.js          (adds data only if collections are empty)
 *         node seed.js --force  (drops existing data first)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Category = require('./models/Category');
const Product = require('./models/Product');

const CLOUD_NAME = 'dbvnu5iqr';
const cloudFetch = (url, w = 400, h = 400) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_${w},h_${h},c_fill,g_center,q_auto,f_auto/${url}`;

// ─── Seed Data ────────────────────────────────────────────────

const categoriesData = [
  { slug: 'hotwheels', name: 'Hot Wheels', image: cloudFetch('https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400', 200, 200), sortOrder: 1 },
  { slug: 'majorette', name: 'Majorette', image: cloudFetch('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400', 200, 200), sortOrder: 2 },
  { slug: 'matchbox', name: 'Matchbox', image: cloudFetch('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400', 200, 200), sortOrder: 3 },
  { slug: 'tomica', name: 'Tomica', image: cloudFetch('https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400', 200, 200), sortOrder: 4 },
  { slug: 'greenlight', name: 'Greenlight', image: cloudFetch('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', 200, 200), sortOrder: 5 },
  { slug: 'jada', name: 'Jada Toys', image: cloudFetch('https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400', 200, 200), sortOrder: 6 },
  { slug: 'autoworld', name: 'Auto World', image: cloudFetch('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', 200, 200), sortOrder: 7 },
  { slug: 'maisto', name: 'Maisto', image: cloudFetch('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400', 200, 200), sortOrder: 8 },
];

const productsData = [
  { name: 'Hot Wheels Porsche 911 GT3', price: 249, discount: 17, category: 'hotwheels', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400') },
  { name: 'Matchbox Ford Mustang 1967', price: 199, discount: 0, category: 'matchbox', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400') },
  { name: 'Majorette Lamborghini Aventador', price: 350, discount: 22, category: 'majorette', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400') },
  { name: 'Tomica Toyota Supra GR', price: 299, discount: 10, category: 'tomica', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400') },
  { name: 'Hot Wheels Tesla Cybertruck', price: 399, discount: 0, category: 'hotwheels', scale: '1:43', image: cloudFetch('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400') },
  { name: 'Maisto Chevrolet Corvette C8', price: 450, discount: 15, category: 'maisto', scale: '1:24', image: cloudFetch('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400') },
  { name: 'Jada Toys Dodge Charger R/T', price: 275, discount: 0, category: 'jada', scale: '1:32', image: cloudFetch('https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400') },
  { name: 'Auto World Ford GT40 MkII', price: 520, discount: 8, category: 'autoworld', scale: '1:18', image: cloudFetch('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400') },
  { name: 'Hot Wheels BMW M3 GTR', price: 189, discount: 25, category: 'hotwheels', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400') },
  { name: 'Majorette Mercedes AMG GT', price: 320, discount: 12, category: 'majorette', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400') },
  { name: 'Matchbox Land Rover Defender', price: 229, discount: 5, category: 'matchbox', scale: '1:64', image: cloudFetch('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400') },
  { name: 'Greenlight Shelby GT500', price: 380, discount: 0, category: 'greenlight', scale: '1:24', image: cloudFetch('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400') },
];

// ─── Runner ───────────────────────────────────────────────────

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const force = process.argv.includes('--force');

    if (force) {
      await Category.deleteMany({});
      await Product.deleteMany({});
      console.log('Existing categories & products removed');
    }

    // Categories
    const existingCats = await Category.countDocuments();
    if (existingCats === 0) {
      await Category.insertMany(categoriesData);
      console.log(`${categoriesData.length} categories seeded`);
    } else {
      console.log(`Categories already exist (${existingCats}), skipping. Use --force to re-seed.`);
    }

    // Products
    const existingProds = await Product.countDocuments();
    if (existingProds === 0) {
      await Product.insertMany(productsData);
      console.log(`${productsData.length} products seeded`);
    } else {
      console.log(`Products already exist (${existingProds}), skipping. Use --force to re-seed.`);
    }

    console.log('Seed complete ✓');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

run();
