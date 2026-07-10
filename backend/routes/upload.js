const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Image storage config
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const productName = req.body.productName
      ? req.body.productName.trim().replace(/\s+/g, '_').toLowerCase()
      : 'uncategorized';

    return {
      folder: `product/${productName}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

// Video storage config
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const productName = req.body.productName
      ? req.body.productName.trim().replace(/\s+/g, '_').toLowerCase()
      : 'uncategorized';

    return {
      folder: `product/${productName}/videos`,
      resource_type: 'video',
      allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
    };
  },
});

const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

// Upload multiple images
router.post('/images', imageUpload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const imageUrls = req.files.map((file) => file.path);
    res.status(200).json({ message: 'Images uploaded successfully', urls: imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
});

// Upload single video
router.post('/video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }
    res.status(200).json({ message: 'Video uploaded successfully', url: req.file.path });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Server error during video upload' });
  }
});

// Keep old route for backward compatibility
router.post('/', imageUpload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const imageUrls = req.files.map((file) => file.path);
    res.status(200).json({ message: 'Images uploaded successfully', urls: imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;
