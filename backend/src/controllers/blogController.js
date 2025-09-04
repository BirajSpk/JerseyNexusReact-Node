const { asyncHandler, sendResponse, generateSlug } = require('../utils/helpers');
const { prisma, executeWithRetry } = require('../config/database');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
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

  if (!blog || !blog.published) {
    return sendResponse(res, 404, false, 'Blog not found');
  }

  sendResponse(res, 200, true, 'Blog retrieved successfully', { blog });
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content, categoryId, published = false, status = 'DRAFT', imageUrl, existingFeaturedImage, metaTitle, metaDescription, slug } = req.body;
    const authorId = req.user.id;

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

    // Handle featured image
    let featuredImageUrl = null;
    if (req.file) {
      // New uploaded file
      featuredImageUrl = `/uploads/blogs/${req.file.filename}`;
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
        images: featuredImageUrl ? JSON.stringify([{ url: featuredImageUrl, altText: title, isPrimary: true }]) : null
      },
      include: { category: true, author: { select: { name: true } } }
    });

    sendResponse(res, 201, true, 'Blog created successfully', { blog });
  } catch (error) {
    console.error('Blog creation error:', error);
    sendResponse(res, 500, false, 'Failed to create blog', { error: error.message });
  }
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

  const data = { ...rest };

  if (rest.slug) {
    data.slug = generateSlug(rest.slug);
  }
  if (rest.metaTitle) {
    data.metaTitle = rest.metaTitle;
  }
  if (rest.metaDescription) {
    data.metaDescription = rest.metaDescription;
  }

  // Handle featured image update
  if (req.file) {
    // New uploaded file
    data.featuredImage = `/uploads/blogs/${req.file.filename}`;
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
  
  await prisma.blog.delete({ where: { id } });
  
  sendResponse(res, 200, true, 'Blog deleted successfully');
});

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};