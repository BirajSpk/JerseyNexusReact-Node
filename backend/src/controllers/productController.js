const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse, getPagination, generateSlug } = require('../utils/helpers');

const prisma = new PrismaClient();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  
  const { skip, take } = getPagination(page, limit);
  
  const products = await prisma.product.findMany({
    skip,
    take,
    include: {
      category: { select: { id: true, name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  sendResponse(res, 200, true, 'Products retrieved successfully', { products });
});

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: true } } }
  });

  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  sendResponse(res, 200, true, 'Product retrieved successfully', { product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  
  const slug = generateSlug(name);
  
  const product = await prisma.product.create({
    data: { name, description, price, stock, categoryId, slug },
    include: { category: true }
  });

  sendResponse(res, 201, true, 'Product created successfully', { product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const product = await prisma.product.update({
    where: { id },
    data: req.body,
    include: { category: true }
  });

  sendResponse(res, 200, true, 'Product updated successfully', { product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await prisma.product.delete({ where: { id } });
  
  sendResponse(res, 200, true, 'Product deleted successfully');
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};