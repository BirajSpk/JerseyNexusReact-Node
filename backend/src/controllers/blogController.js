const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse, generateSlug } = require('../utils/helpers');

const prisma = new PrismaClient();

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
  const { title, content, categoryId, published = false } = req.body;
  const authorId = req.user.id;
  
  const slug = generateSlug(title);
  
  const blog = await prisma.blog.create({
    data: { title, content, categoryId, authorId, slug, published },
    include: { category: true, author: { select: { name: true } } }
  });

  sendResponse(res, 201, true, 'Blog created successfully', { blog });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const blog = await prisma.blog.update({
    where: { id },
    data: req.body,
    include: { category: true, author: { select: { name: true } } }
  });

  sendResponse(res, 200, true, 'Blog updated successfully', { blog });
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