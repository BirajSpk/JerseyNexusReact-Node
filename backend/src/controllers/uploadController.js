const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');

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

// Configure multer for different upload types
const createMulterConfig = (destination, fileTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
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

// @desc    Upload profile image and update user avatar
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
      const fileUrl = `/uploads/profiles/${req.file.filename}`;
      const userId = req.user.id;

      // Get current user to check for existing avatar
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
      });

      // Delete old avatar file if it exists and is not a default image
      if (currentUser?.avatar && currentUser.avatar.startsWith('/uploads/profiles/')) {
        const oldFilename = path.basename(currentUser.avatar);
        const oldFilePath = path.join(profilesDir, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
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
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user avatar:', error);

      // Delete uploaded file if database update fails
      const filePath = path.join(profilesDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      sendResponse(res, 500, false, 'Failed to update profile image');
    }
  });
});

// @desc    Upload editor image/video
// @route   POST /api/uploads/editor
// @access  Private (Admin only for rich text editor)
const uploadEditorMedia = asyncHandler(async (req, res) => {
  const upload = editorUpload.single('media');
  
  upload(req, res, (err) => {
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

    const fileUrl = `/uploads/editor/${req.file.filename}`;
    
    sendResponse(res, 200, true, 'Media uploaded successfully', {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
    });
  });
});

// @desc    Upload multiple product images
// @route   POST /api/uploads/products
// @access  Private (Admin only)
const uploadProductImages = asyncHandler(async (req, res) => {
  const upload = createMulterConfig(path.join(uploadsDir, 'products')).array('images', 10);
  
  upload(req, res, (err) => {
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

    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      altText: req.body.altText || ''
    }));
    
    sendResponse(res, 200, true, 'Product images uploaded successfully', {
      files: uploadedFiles
    });
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/uploads/delete
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  const { filepath } = req.body;
  
  if (!filepath) {
    return sendResponse(res, 400, false, 'File path is required');
  }
  
  // Security check: ensure file is in uploads directory
  const fullPath = path.join(__dirname, '../../', filepath);
  const uploadsPath = path.join(__dirname, '../../uploads');
  
  if (!fullPath.startsWith(uploadsPath)) {
    return sendResponse(res, 400, false, 'Invalid file path');
  }
  
  try {
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

module.exports = {
  uploadProfileImage,
  uploadEditorMedia,
  uploadProductImages,
  deleteFile
};