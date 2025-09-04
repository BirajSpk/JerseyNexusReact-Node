const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const { uploadBufferToCloudinary, deleteFromCloudinaryByUrl } = require('../utils/cloudinary');
const { cleanupOrphanedImages } = require('../utils/imageCleanup');

const CLOUDINARY_BASE_FOLDER = process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const editorDir = path.join(uploadsDir, 'editor');
const productsDir = path.join(uploadsDir, 'products');

[uploadsDir, profilesDir, editorDir, productsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for different upload types (memory storage for Cloudinary)
const createMulterConfig = (destination, fileTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || `${5 * 1024 * 1024}`, 10), // default 5MB
    },
    fileFilter: (req, file, cb) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed types: ${fileTypes.join(', ')}`), false);
      }
    }
  });
};

// Multer configurations
const profileUpload = createMulterConfig(profilesDir);
const editorUpload = createMulterConfig(editorDir, [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm'
]);

// @desc    Upload profile image and update user avatar (Cloudinary)
// @route   POST /api/uploads/profile
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
  const upload = profileUpload.single('profile');

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File too large. Maximum size is 5MB.');
      }
      return sendResponse(res, 400, false, `Upload error: ${err.message}`);
    } else if (err) {
      return sendResponse(res, 400, false, err.message);
    }

    if (!req.file) {
      return sendResponse(res, 400, false, 'No file uploaded');
    }

    try {
      const userId = req.user.id;

      // Upload new image to Cloudinary
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `${CLOUDINARY_BASE_FOLDER}/profiles/${userId}`,
        resourceType: 'image',
      });

      const fileUrl = result.secure_url;

      // Get current user to check for existing avatar
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
      });

      // Delete old avatar in Cloudinary if exists
      if (currentUser?.avatar) {
        await deleteFromCloudinaryByUrl(currentUser.avatar, 'image').catch(() => {});
      }

      // Update user's avatar in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: fileUrl },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      sendResponse(res, 200, true, 'Profile image uploaded and updated successfully', {
        url: fileUrl,
        filename: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user avatar:', error);
      sendResponse(res, 500, false, 'Failed to update profile image');
    }
  });
});

// @desc    Upload editor image/video (Cloudinary)
// @route   POST /api/uploads/editor
// @access  Private (Admin only for rich text editor)
const uploadEditorMedia = asyncHandler(async (req, res) => {
  const upload = editorUpload.single('media');

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File too large. Maximum size is 5MB.');
      }
      return sendResponse(res, 400, false, `Upload error: ${err.message}`);
    } else if (err) {
      return sendResponse(res, 400, false, err.message);
    }

    if (!req.file) {
      return sendResponse(res, 400, false, 'No file uploaded');
    }

    try {
      const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `${CLOUDINARY_BASE_FOLDER}/editor`,
        resourceType,
      });

      sendResponse(res, 200, true, 'Media uploaded successfully', {
        url: result.secure_url,
        filename: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        type: resourceType
      });
    } catch (error) {
      console.error('Editor media upload error:', error);
      sendResponse(res, 500, false, 'Failed to upload media');
    }
  });
});

// @desc    Upload multiple product images (Cloudinary utility endpoint)
// @route   POST /api/uploads/products
// @access  Private (Admin only)
const uploadProductImages = asyncHandler(async (req, res) => {
  const upload = createMulterConfig('memory').array('images', 10);

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File too large. Maximum size is 5MB per file.');
      }
      return sendResponse(res, 400, false, `Upload error: ${err.message}`);
    } else if (err) {
      return sendResponse(res, 400, false, err.message);
    }

    if (!req.files || req.files.length === 0) {
      return sendResponse(res, 400, false, 'No files uploaded');
    }

    try {
      const uploads = [];
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `${CLOUDINARY_BASE_FOLDER}/products/misc`,
          resourceType: 'image',
        });
        uploads.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          altText: req.body.altText || ''
        });
      }

      sendResponse(res, 200, true, 'Product images uploaded successfully', {
        files: uploads
      });
    } catch (error) {
      console.error('Product images upload error:', error);
      sendResponse(res, 500, false, 'Failed to upload product images');
    }
  });
});

// @desc    Delete uploaded file (supports Cloudinary URLs)
// @route   DELETE /api/uploads/delete
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  const { filepath } = req.body;

  if (!filepath) {
    return sendResponse(res, 400, false, 'File path or URL is required');
  }

  // If Cloudinary URL
  if (typeof filepath === 'string' && filepath.includes('res.cloudinary.com')) {
    try {
      const result = await deleteFromCloudinaryByUrl(filepath, 'image');
      return sendResponse(res, 200, true, 'Cloudinary file deletion attempted', { result });
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return sendResponse(res, 500, false, 'Failed to delete Cloudinary file');
    }
  }

  // Otherwise, local file deletion for legacy assets
  try {
    // Security check: ensure file is in uploads directory
    const fullPath = path.join(__dirname, '../../', filepath);
    const uploadsPath = path.join(__dirname, '../../uploads');

    if (!fullPath.startsWith(uploadsPath)) {
      return sendResponse(res, 400, false, 'Invalid file path');
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      sendResponse(res, 200, true, 'File deleted successfully');
    } else {
      sendResponse(res, 404, false, 'File not found');
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    sendResponse(res, 500, false, 'Error deleting file');
  }
});

// @desc    Clean up orphaned images from Cloudinary
// @route   POST /api/uploads/cleanup
// @access  Private/Admin
const cleanupOrphanedCloudinaryImages = asyncHandler(async (req, res) => {
  try {
    const result = await cleanupOrphanedImages();

    sendResponse(res, 200, true, 'Orphaned image cleanup completed', {
      cleanup_summary: result
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    sendResponse(res, 500, false, 'Failed to cleanup orphaned images', {
      error: error.message
    });
  }
});

module.exports = {
  uploadProfileImage,
  uploadEditorMedia,
  uploadProductImages,
  deleteFile,
  cleanupOrphanedCloudinaryImages
};