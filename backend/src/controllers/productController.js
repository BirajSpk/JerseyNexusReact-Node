const { asyncHandler, sendResponse, getPagination, generateSlug } = require('../utils/helpers');
const { prisma, executeWithRetry } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Configure multer for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
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

// @desc    Create product with image upload
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Handle file upload first
  upload.array('images', 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File too large. Maximum size is 5MB per file.');
      }
      return sendResponse(res, 400, false, `Upload error: ${err.message}`);
    } else if (err) {
      return sendResponse(res, 400, false, err.message);
    }

    try {
      const {
        name,
        description,
        price,
        salePrice,
        stock,
        categoryId,
        featured = false,
        status = 'ACTIVE',
        sizes,
        colors,
        metaTitle,
        metaDescription,
        keywords,
        slug: providedSlug,
        metaTags
      } = req.body;

      // Validate required fields
      if (!name || !price || !stock || !categoryId) {
        return sendResponse(res, 400, false, 'Missing required fields: name, price, stock, categoryId');
      }

      // Validate category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return sendResponse(res, 400, false, 'Category not found');
      }

      // Use provided slug or generate from name
      let slug = providedSlug && providedSlug.trim().length > 0 ? generateSlug(providedSlug) : generateSlug(name);

      // Check if slug already exists and make it unique
      let slugExists = await prisma.product.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        const baseSlug = providedSlug && providedSlug.trim().length > 0 ? generateSlug(providedSlug) : generateSlug(name);
        slug = `${baseSlug}-${counter}`;
        slugExists = await prisma.product.findUnique({ where: { slug } });
        counter++;
      }

      // Parse numeric values
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return sendResponse(res, 400, false, 'Invalid price value');
      }

      if (isNaN(parsedStock) || parsedStock < 0) {
        return sendResponse(res, 400, false, 'Invalid stock value');
      }

      // Create product with transaction to handle images
      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            name,
            description: description || '',
            price: parsedPrice,
            salePrice: salePrice ? parseFloat(salePrice) : null,
            stock: parsedStock,
            categoryId,
            slug,
            featured: featured === 'true' || featured === true,
            status: status || 'ACTIVE',
            sizes: sizes ? JSON.stringify(sizes) : null,
            colors: colors ? JSON.stringify(colors) : null,
            metaTitle: metaTitle || name,
            metaDescription: metaDescription || description,
            keywords: keywords || null,
            metaTags: metaTags || null
          }
        });

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
          const imageData = req.files.map((file, index) => ({
            productId: newProduct.id,
            url: `/uploads/products/${file.filename}`,
            altText: `${name} image ${index + 1}`,
            sortOrder: index
          }));

          await tx.productImage.createMany({
            data: imageData
          });
        }

        return tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            category: true,
            productImages: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        });
      });

      sendResponse(res, 201, true, 'Product created successfully', { product });
    } catch (error) {
      console.error('Product creation error:', error);

      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return sendResponse(res, 400, false, 'Product with this name already exists');
      }
      if (error.code === 'P2003') {
        return sendResponse(res, 400, false, 'Invalid category ID');
      }

      sendResponse(res, 500, false, `Failed to create product: ${error.message}`);
    }
  });
});

// @desc    Update product with image upload
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Handle file upload first
  upload.array('images', 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File too large. Maximum size is 5MB per file.');
      }
      return sendResponse(res, 400, false, `Upload error: ${err.message}`);
    } else if (err) {
      return sendResponse(res, 400, false, err.message);
    }

    try {
      const {
        name,
        description,
        price,
        salePrice,
        stock,
        categoryId,
        featured,
        status,
        sizes,
        colors,
        metaTitle,
        metaDescription,
        keywords,
        slug: providedSlug,
        metaTags,
        existingImages
      } = req.body;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      });

      if (!existingProduct) {
        return sendResponse(res, 404, false, 'Product not found');
      }

      // Validate category if provided
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        });

        if (!category) {
          return sendResponse(res, 400, false, 'Category not found');
        }
      }

      // Update product with transaction to handle images
      const product = await prisma.$transaction(async (tx) => {
        // Prepare update data
        const updateData = {};

        if (name !== undefined) {
          updateData.name = name;
        }

        // Handle slug update with uniqueness check
        if (providedSlug !== undefined || name !== undefined) {
          let newSlug = providedSlug && providedSlug.trim().length > 0 ? generateSlug(providedSlug) : generateSlug(name || existingProduct.name);

          // Check if slug already exists (excluding current product)
          let slugExists = await tx.product.findFirst({
            where: {
              slug: newSlug,
              id: { not: id }
            }
          });
          let counter = 1;
          while (slugExists) {
            const baseSlug = providedSlug && providedSlug.trim().length > 0 ? generateSlug(providedSlug) : generateSlug(name || existingProduct.name);
            newSlug = `${baseSlug}-${counter}`;
            slugExists = await tx.product.findFirst({
              where: {
                slug: newSlug,
                id: { not: id }
              }
            });
            counter++;
          }
          updateData.slug = newSlug;
        }
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) {
          const parsedPrice = parseFloat(price);
          if (isNaN(parsedPrice) || parsedPrice < 0) {
            throw new Error('Invalid price value');
          }
          updateData.price = parsedPrice;
        }
        if (stock !== undefined) {
          const parsedStock = parseInt(stock);
          if (isNaN(parsedStock) || parsedStock < 0) {
            throw new Error('Invalid stock value');
          }
          updateData.stock = parsedStock;
        }
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;
        if (status !== undefined) updateData.status = status;
        if (sizes !== undefined) updateData.sizes = sizes ? JSON.stringify(sizes) : null;
        if (colors !== undefined) updateData.colors = colors ? JSON.stringify(colors) : null;
        if (salePrice !== undefined) updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
        if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
        if (keywords !== undefined) updateData.keywords = keywords;
        if (metaTags !== undefined) updateData.metaTags = metaTags;

        // Update product
        const updatedProduct = await tx.product.update({
          where: { id },
          data: updateData
        });

        // Handle image updates
        if (req.files && req.files.length > 0) {
          // When new images are uploaded, completely replace all existing images
          const currentImages = await tx.productImage.findMany({
            where: { productId: id }
          });

          // Delete all existing images
          for (const img of currentImages) {
            // Delete file from filesystem
            const filename = path.basename(img.url);
            const filePath = path.join(productsDir, filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            // Delete from database
            await tx.productImage.delete({
              where: { id: img.id }
            });
          }

          // Add new images
          const newImageData = req.files.map((file, index) => ({
            productId: id,
            url: `/uploads/products/${file.filename}`,
            altText: `${name || 'Product'} image ${index + 1}`,
            isPrimary: index === 0, // First image is primary
            sortOrder: index
          }));

          await tx.productImage.createMany({
            data: newImageData
          });
        }

        return tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            productImages: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        });
      });

      sendResponse(res, 200, true, 'Product updated successfully', { product });
    } catch (error) {
      console.error('Product update error:', error);
      sendResponse(res, 500, false, 'Failed to update product');
    }
  });
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