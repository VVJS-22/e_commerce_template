const express = require('express');
const router = express.Router();
const { getCategories, getCategory } = require('../controllers/catalogController');

router.get('/', getCategories);
router.get('/:slug', getCategory);

module.exports = router;
