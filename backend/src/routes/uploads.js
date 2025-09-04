const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const {
  uploadProfileImage,
  uploadEditorMedia,
  uploadProductImages,
  deleteFile,
  cleanupOrphanedCloudinaryImages
} = require('../controllers/uploadController');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Profile image upload (authenticated users)
router.post('/profile', uploadProfileImage);

// Editor media upload (admin only)
router.post('/editor', authorize('ADMIN'), uploadEditorMedia);

// Product images upload (admin only)
router.post('/products', authorize('ADMIN'), uploadProductImages);

// Delete file (owner or admin)
router.delete('/delete', deleteFile);

// Cleanup orphaned images (admin only)
router.post('/cleanup', authorize('ADMIN'), cleanupOrphanedCloudinaryImages);

module.exports = router;