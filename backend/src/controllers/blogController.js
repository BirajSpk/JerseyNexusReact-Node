const { asyncHandler, sendResponse, generateSlug } = require('../utils/helpers');
const { prisma, executeWithRetry } = require('../config/database');
const multer = require('multer');
const { uploadBufferToCloudinary, deleteFromCloudinaryByUrl } = require('../utils/cloudinary');

// Configure multer for blog images (memory storage for Cloudinary)
const upload = multer({
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

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const { published } = req.query;
  const isAdmin = req.user && req.user.role === 'ADMIN';

  // Build where clause based on query parameters and user role
  let whereClause = {};

  // If published=true is requested, or user is not admin, filter for published blogs only
  if (published === 'true' || !isAdmin) {
    whereClause = {
      OR: [
        { published: true },
        { status: 'PUBLISHED' }
      ]
    };
  }

  const blogs = await prisma.blog.findMany({
    where: whereClause,
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  sendResponse(res, 200, true, 'Blogs retrieved successfully', { blogs });
});

// @desc    Get single blog
// @route   GET /api/blogs/slug/:slug or GET /api/blogs/:id
// @access  Public
const getBlog = asyncHandler(async (req, res) => {
  const { slug, id } = req.params;

  let whereClause;
  if (slug) {
    whereClause = { slug };
  } else if (id) {
    whereClause = { id };
  } else {
    return sendResponse(res, 400, false, 'Blog slug or id is required');
  }

  const blog = await prisma.blog.findUnique({
    where: whereClause,
    include: {
      category: true,
      author: { select: { name: true, avatar: true } }
    }
  });

  if (!blog) {
    return sendResponse(res, 404, false, 'Blog not found');
  }

  // Check if blog is published (either published field is true OR status is PUBLISHED)
  // For admin users, allow access to all blogs regardless of status
  const isPublished = blog.published || blog.status === 'PUBLISHED';
  const isAdmin = req.user && req.user.role === 'ADMIN';

  if (!isPublished && !isAdmin) {
    return sendResponse(res, 404, false, 'Blog not found');
  }

  sendResponse(res, 200, true, 'Blog retrieved successfully', { blog });
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  const uploadSingle = upload.single('featuredImage');

  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return sendResponse(res, 400, false, err.message);
    }

    try {
      console.log("creating blog ");
      const { title, content, categoryId, published = false, status = 'DRAFT', imageUrl, existingFeaturedImage, metaTitle, metaDescription, slug, keywords, metaTags, excerpt } = req.body;
      const authorId = req.user.id;

      console.table(req.body);
    // Validate required fields
    if (!title || !content || !categoryId) {
      return sendResponse(res, 400, false, 'Missing required fields: title, content, categoryId');
    }

    // Validate field lengths
    if (title.length < 5 || title.length > 200) {
      return sendResponse(res, 400, false, 'Blog title must be between 5 and 200 characters');
    }

    if (content.length < 10) {
      return sendResponse(res, 400, false, 'Blog content must be at least 10 characters');
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return sendResponse(res, 400, false, 'Category not found');
    }

    const computedSlug = slug && slug.trim().length > 0 ? generateSlug(slug) : generateSlug(title);

      // Handle featured image with Cloudinary upload
      let featuredImageUrl = null;
      if (req.file) {
        // Upload to Cloudinary
        const result = await uploadBufferToCloudinary(req.file.buffer, {
          folder: `${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/blogs`,
          resourceType: 'image',
        });
        featuredImageUrl = result.secure_url;
      } else if (existingFeaturedImage) {
        // Existing image URL
        featuredImageUrl = existingFeaturedImage;
      } else if (imageUrl) {
        // Legacy imageUrl field
        featuredImageUrl = imageUrl;
      }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        categoryId,
        authorId,
        slug: computedSlug,
        published,
        status: published ? 'PUBLISHED' : status,
        featuredImage: featuredImageUrl,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || content?.substring(0, 160),
        keyword: keywords ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [],
        metaTags : metaTags || null,
        images: featuredImageUrl ? JSON.stringify([{ url: featuredImageUrl, altText: title, isPrimary: true }]) : null
      },
      include: { category: true, author: { select: { name: true } } }
    });

      console.log("Blog is created successfully")
      sendResponse(res, 201, true, 'Blog created successfully', { blog });
    } catch (error) {
      console.error('Blog creation error:', error);
      sendResponse(res, 500, false, 'Failed to create blog', { error: error.message });
    }
  });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageUrl, existingFeaturedImage, ...rest } = req.body;

  // Check if blog exists first
  const existingBlog = await prisma.blog.findUnique({
    where: { id }
  });

  if (!existingBlog) {
    return sendResponse(res, 404, false, 'Blog not found');
  }

  // Only include valid fields for blog update
  const validFields = ['title', 'content', 'categoryId', 'published', 'status', 'metaTitle', 'metaDescription', 'slug', 'keywords', 'metaTags'];
  const data = {};

  validFields.forEach(field => {
    if (rest[field] !== undefined) {
      data[field] = rest[field];
    }
  });

  if (rest.slug) {
    data.slug = generateSlug(rest.slug);
  }
  if (rest.metaTitle) {
    data.metaTitle = rest.metaTitle;
  }
  if (rest.metaDescription) {
    data.metaDescription = rest.metaDescription;
  }
  if (rest.keywords) {
    data.keyword = typeof rest.keywords === 'string'
      ? rest.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      : rest.keywords;
  }
  if (rest.metaTags) {
    data.metaTags = rest.metaTags;
  }

  // Handle featured image update
  if (req.file && req.file.cloudinaryUrl) {
    // New uploaded file via Cloudinary - delete old if existed and was Cloudinary
    try {
      if (existingBlog.featuredImage && existingBlog.featuredImage.includes('res.cloudinary.com')) {
        const { deleteFromCloudinaryByUrl } = require('../utils/cloudinary');
        await deleteFromCloudinaryByUrl(existingBlog.featuredImage, 'image');
      }
    } catch (e) {}
    data.featuredImage = req.file.cloudinaryUrl;
    data.images = JSON.stringify([{ url: data.featuredImage, altText: rest.title || 'Blog Image', isPrimary: true }]);
  } else if (existingFeaturedImage) {
    // Keep existing image
    data.featuredImage = existingFeaturedImage;
    data.images = JSON.stringify([{ url: existingFeaturedImage, altText: rest.title || 'Blog Image', isPrimary: true }]);
  } else if (imageUrl) {
    // Legacy imageUrl field
    data.featuredImage = imageUrl;
    data.images = JSON.stringify([{ url: imageUrl, altText: rest.title || 'Blog Image', isPrimary: true }]);
  }

  try {
    const blog = await prisma.blog.update({
      where: { id },
      data,
      include: { category: true, author: { select: { name: true } } }
    });

    sendResponse(res, 200, true, 'Blog updated successfully', { blog });
  } catch (error) {
    console.error('Blog update error:', error);
    sendResponse(res, 500, false, 'Failed to update blog', { error: error.message });
  }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get blog with featured image before deletion
  const blog = await prisma.blog.findUnique({
    where: { id },
    select: { featuredImage: true, images: true }
  });

  if (!blog) {
    return sendResponse(res, 404, false, 'Blog not found');
  }

  // Delete blog from database
  await prisma.blog.delete({ where: { id } });

  // Delete featured image from Cloudinary if exists
  if (blog.featuredImage) {
    await deleteFromCloudinaryByUrl(blog.featuredImage, 'image').catch((error) => {
      console.error('Failed to delete blog featured image from Cloudinary:', error);
    });
  }

  // Delete content images from Cloudinary if exists
  if (blog.images) {
    try {
      const imageArray = typeof blog.images === 'string' ? JSON.parse(blog.images) : blog.images;
      if (Array.isArray(imageArray)) {
        for (const img of imageArray) {
          if (img.url) {
            await deleteFromCloudinaryByUrl(img.url, 'image').catch((error) => {
              console.error('Failed to delete blog content image from Cloudinary:', error);
            });
          }
        }
      }
    } catch (parseError) {
      console.error('Failed to parse blog images for cleanup:', parseError);
    }
  }

  sendResponse(res, 200, true, 'Blog deleted successfully');
});

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};