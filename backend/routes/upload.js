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

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the product name for the folder structure
    // We expect the frontend to pass 'productName' in the form data
    const productName = req.body.productName ? req.body.productName.trim().replace(/\s+/g, '_').toLowerCase() : 'uncategorized';
    
    return {
      folder: `product/${productName}`, // Folder structure: product/<product_name>
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const upload = multer({ storage: storage });

// Upload route for multiple images
// The field name from the frontend must be 'images'
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Extract the secure URLs from the uploaded files
    const imageUrls = req.files.map(file => file.path); // multer-storage-cloudinary provides the Cloudinary URL in file.path

    res.status(200).json({
      message: 'Images uploaded successfully',
      urls: imageUrls,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;
