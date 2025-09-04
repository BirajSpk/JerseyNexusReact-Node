const multer = require('multer');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

// Configure multer for blog images (memory storage for Cloudinary)
const blogUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

// Middleware for blog image upload -> attaches cloudinaryUrl in req.file.cloudinary
const uploadBlogImage = (req, res, next) => {
  blogUpload.single('featuredImage')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer, {
          folder: `${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/blogs`,
          resourceType: 'image',
        });
        req.file.cloudinaryUrl = result.secure_url;
        req.file.cloudinaryPublicId = result.public_id;
      }
      next();
    } catch (e) {
      console.error('Blog image upload error:', e);
      return res.status(500).json({ success: false, message: 'Failed to upload blog image' });
    }
  });
};

module.exports = {
  uploadBlogImage
};
