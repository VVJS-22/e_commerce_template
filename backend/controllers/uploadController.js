const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');
const { Readable } = require('stream');

// Multer memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper: upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `crazywheelz/${folder}`,
        transformation: [
          { width: 600, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// @desc    Upload a single image
// @route   POST /api/upload
// @access  Private (admin)
const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const folder = req.body.folder || 'general';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    logger.info(`Image uploaded to Cloudinary: ${result.public_id} by ${req.user.email}`);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (err) {
    logger.error(`Upload error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};

module.exports = { upload, handleUpload };
