const { asyncHandler, sendResponse, getPagination, generateSlug } = require('../utils/helpers');
const { prisma, executeWithRetry } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadBufferToCloudinary, deleteFromCloudinaryByUrl } = require('../utils/cloudinary');

// Configure multer for product images (memory storage for Cloudinary)
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
        slug: providedSlug
      } = req.body;

      // Validate required fields
      const validationErrors = [];

      if (!name || name.trim().length < 2 || name.trim().length > 200) {
        validationErrors.push({ message: 'Product name must be between 2 and 200 characters', value: name });
      }

      if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        validationErrors.push({ message: 'Price must be a positive number' });
      }

      if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
        validationErrors.push({ message: 'Stock must be a non-negative integer' });
      }

      if (!categoryId) {
        validationErrors.push({ message: 'Category is required' });
      }

      if (validationErrors.length > 0) {
        return sendResponse(res, 400, false, 'Validation failed', { details: validationErrors });
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
            metaDescription: metaDescription || description
          }
        });

        // Handle uploaded images via Cloudinary
        if (req.files && req.files.length > 0) {
          const uploads = [];
          let sortIndex = 0;
          for (const file of req.files) {
            const result = await uploadBufferToCloudinary(file.buffer, {
              folder: `${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/products/${newProduct.id}`,
              resourceType: 'image',
            });
            uploads.push({
              productId: newProduct.id,
              url: result.secure_url,
              altText: `${name} image ${sortIndex + 1}`,
              isPrimary: sortIndex === 0,
              sortOrder: sortIndex,
            });
            sortIndex++;
          }

          await tx.productImage.createMany({ data: uploads });
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

  // Handle file upload
  upload.array('images', 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File too large. Max 5MB per file.');
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
        slug: providedSlug
      } = req.body;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) return sendResponse(res, 404, false, 'Product not found');

      // Start transaction
      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Handle slug uniqueness
        let newSlug = existingProduct.slug;
        if (providedSlug !== undefined || name !== undefined) {
          newSlug =
            providedSlug && providedSlug.trim().length > 0
              ? generateSlug(providedSlug)
              : generateSlug(name || existingProduct.name);

          let slugExists = await tx.product.findFirst({
            where: { slug: newSlug, id: { not: id } }
          });
          let counter = 1;
          while (slugExists) {
            const baseSlug =
              providedSlug && providedSlug.trim().length > 0
                ? generateSlug(providedSlug)
                : generateSlug(name || existingProduct.name);
            newSlug = `${baseSlug}-${counter}`;
            slugExists = await tx.product.findFirst({
              where: { slug: newSlug, id: { not: id } }
            });
            counter++;
          }
        }

        // Prepare data for update
        const data = {
          name,
          description,
          price: price !== undefined ? parseFloat(price) : undefined,
          salePrice: salePrice ? parseFloat(salePrice) : null,
          stock: stock !== undefined ? parseInt(stock) : undefined,
          featured: featured !== undefined ? featured === 'true' || featured === true : undefined,
          status,
          sizes: sizes ? JSON.stringify(sizes) : null,
          colors: colors ? JSON.stringify(colors) : null,
          metaTitle,
          metaDescription,
          slug: newSlug,
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {})
        };

        // Update product
        const product = await tx.product.update({
          where: { id },
          data
        });

        // Handle images with Cloudinary
        if (req.files && req.files.length > 0) {
          const currentImages = await tx.productImage.findMany({ where: { productId: id } });

          // Delete old images from Cloudinary and DB
          for (const img of currentImages) {
            // Attempt to delete from Cloudinary if URL is a Cloudinary URL
            await deleteFromCloudinaryByUrl(img.url, 'image').catch(() => {});
            // Also delete legacy local files
            if (img.url && img.url.startsWith('/uploads/')) {
              try {
                const localPath = path.join(__dirname, '../../', img.url);
                if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
              } catch (_) {}
            }
            await tx.productImage.delete({ where: { id: img.id } });
          }

          // Add new images
          const newImages = [];
          for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index];
            const result = await uploadBufferToCloudinary(file.buffer, {
              folder: `${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/products/${id}`,
              resourceType: 'image',
            });
            newImages.push({
              productId: id,
              url: result.secure_url,
              altText: `${name || 'Product'} image ${index + 1}`,
              isPrimary: index === 0,
              sortOrder: index,
            });
          }

          await tx.productImage.createMany({ data: newImages });
        }

        // Return updated product with relations
        return tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            productImages: { orderBy: { sortOrder: 'asc' } }
          }
        });
      });

      sendResponse(res, 200, true, 'Product updated successfully', { product: updatedProduct });
    } catch (error) {
      console.error('Product update error:', error);
      sendResponse(res, 500, false, error.message || 'Failed to update product');
    }
  });
});

// @desc    Delete product (and its Cloudinary images)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Fetch images to delete from Cloudinary
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  for (const img of images) {
    await deleteFromCloudinaryByUrl(img.url, 'image').catch(() => {});
  }

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

// @desc    Upload multiple images for a product
// @route   POST /api/products/:id/images
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  upload.array('images', 10)(req, res, async (err) => {
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
      // Get current max sort order
      const maxSortOrder = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });

      let nextSortOrder = (maxSortOrder?.sortOrder || -1) + 1;

      const uploads = [];
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/products/${id}`,
          resourceType: 'image',
        });

        uploads.push({
          productId: id,
          url: result.secure_url,
          altText: req.body.altText || `${product.name} image ${nextSortOrder + 1}`,
          isPrimary: false, // New images are not primary by default
          sortOrder: nextSortOrder,
        });
        nextSortOrder++;
      }

      const createdImages = await prisma.productImage.createMany({ data: uploads });

      // Get the updated product with all images
      const updatedProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          productImages: { orderBy: { sortOrder: 'asc' } }
        }
      });

      sendResponse(res, 201, true, 'Images uploaded successfully', {
        product: updatedProduct,
        uploadedCount: uploads.length
      });
    } catch (error) {
      console.error('Product image upload error:', error);
      sendResponse(res, 500, false, 'Failed to upload images');
    }
  });
});

// @desc    Delete a product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  // Check if image exists and belongs to this product
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId: id }
  });

  if (!image) {
    return sendResponse(res, 404, false, 'Image not found');
  }

  try {
    // Delete from database first
    await prisma.productImage.delete({ where: { id: imageId } });

    // Delete from Cloudinary
    await deleteFromCloudinaryByUrl(image.url, 'image').catch((error) => {
      console.error('Failed to delete image from Cloudinary:', error);
      // Continue execution even if Cloudinary deletion fails
    });

    sendResponse(res, 200, true, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete image error:', error);
    sendResponse(res, 500, false, 'Failed to delete image');
  }
});

// @desc    Update product image details (alt text, primary status, sort order)
// @route   PUT /api/products/:id/images/:imageId
// @access  Private/Admin
const updateProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const { altText, isPrimary, sortOrder } = req.body;

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  // Check if image exists and belongs to this product
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId: id }
  });

  if (!image) {
    return sendResponse(res, 404, false, 'Image not found');
  }

  try {
    // If setting as primary, unset other primary images
    if (isPrimary === true) {
      await prisma.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    // Update the image
    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(altText !== undefined && { altText }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) })
      }
    });

    sendResponse(res, 200, true, 'Image updated successfully', { image: updatedImage });
  } catch (error) {
    console.error('Update image error:', error);
    sendResponse(res, 500, false, 'Failed to update image');
  }
});

// @desc    Reorder product images
// @route   PUT /api/products/:id/images/reorder
// @access  Private/Admin
const reorderProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageOrders } = req.body; // Array of { imageId, sortOrder }

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  if (!Array.isArray(imageOrders)) {
    return sendResponse(res, 400, false, 'imageOrders must be an array');
  }

  try {
    // Update sort orders in a transaction
    await prisma.$transaction(async (tx) => {
      for (const { imageId, sortOrder } of imageOrders) {
        await tx.productImage.update({
          where: { id: imageId, productId: id },
          data: { sortOrder: parseInt(sortOrder) }
        });
      }
    });

    // Get updated product with reordered images
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: { orderBy: { sortOrder: 'asc' } }
      }
    });

    sendResponse(res, 200, true, 'Images reordered successfully', { product: updatedProduct });
  } catch (error) {
    console.error('Reorder images error:', error);
    sendResponse(res, 500, false, 'Failed to reorder images');
  }
});

module.exports = {
  getProducts,
  getProduct,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  updateProductImage,
  reorderProductImages,
};