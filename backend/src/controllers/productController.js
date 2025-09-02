const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse, getPagination, generateSlug } = require('../utils/helpers');

const prisma = new PrismaClient();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const search = req.query.search || '';
  const categoryId = req.query.categoryId || req.query.category;
  const featured = req.query.featured === 'true';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  const { skip, take } = getPagination(page, limit);

  // Build where clause
  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(categoryId && { categoryId }),
    ...(featured && { featured: true })
  };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productImages: {
          orderBy: { sortOrder: 'asc' },
          take: 1 // Only get the primary image for list view
        }
      },
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  sendResponse(res, 200, true, 'Products retrieved successfully', {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:slug or GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { slug, id } = req.params;

  let product;

  if (slug) {
    // Search by slug
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: { include: { user: true } },
        productImages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  } else if (id) {
    // Search by ID
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { include: { user: true } },
        productImages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

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

// @desc    Search products with advanced regex
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const query = req.query.q || '';
  const categoryId = req.query.categoryId;
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  const { skip, take } = getPagination(page, limit);

  if (!query.trim()) {
    return sendResponse(res, 400, false, 'Search query is required');
  }

  try {
    // Create regex pattern for flexible search
    // This will match partial words and handle special characters
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);

    // Build search conditions using Prisma's text search capabilities
    const searchConditions = searchTerms.map(term => {
      // Escape special regex characters for safety
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      return {
        OR: [
          { name: { contains: escapedTerm, mode: 'insensitive' } },
          { description: { contains: escapedTerm, mode: 'insensitive' } },
          {
            category: {
              name: { contains: escapedTerm, mode: 'insensitive' }
            }
          }
        ]
      };
    });

    // Build where clause
    const where = {
      AND: [
        // All search terms must match (AND logic)
        ...searchConditions,
        // Additional filters
        ...(categoryId ? [{ categoryId }] : []),
        {
          AND: [
            { price: { gte: minPrice } },
            { price: { lte: maxPrice } }
          ]
        }
      ]
    };

    // Execute search with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          productImages: {
            orderBy: { sortOrder: 'asc' },
            take: 1 // Only get the primary image for search results
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average ratings
    const productsWithRatings = products.map(product => ({
      ...product,
      rating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    sendResponse(res, 200, true, 'Products found successfully', {
      products: productsWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        limit
      },
      searchInfo: {
        query,
        searchTerms,
        resultsCount: total
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    sendResponse(res, 500, false, 'Failed to search products');
  }
});

module.exports = {
  getProducts,
  getProduct,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};