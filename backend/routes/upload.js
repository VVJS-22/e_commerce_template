const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUpload } = require('../controllers/uploadController');

router.post('/', protect, authorize('admin'), upload.single('image'), handleUpload);

module.exports = router;
