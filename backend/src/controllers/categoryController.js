const { asyncHandler, sendResponse, generateSlug } = require('../utils/helpers');
const { prisma } = require('../config/database');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const type = req.query.type || 'PRODUCT';
  
  const categories = await prisma.category.findMany({
    where: { type },
    orderBy: { name: 'asc' }
  });

  sendResponse(res, 200, true, 'Categories retrieved successfully', { categories });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, type = 'PRODUCT' } = req.body;
  
  const slug = generateSlug(name);
  
  const category = await prisma.category.create({
    data: { name, slug, type }
  });

  sendResponse(res, 201, true, 'Category created successfully', { category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await prisma.category.update({
    where: { id },
    data: req.body
  });

  sendResponse(res, 200, true, 'Category updated successfully', { category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category has products
  const productsCount = await prisma.product.count({
    where: { categoryId: id }
  });

  if (productsCount > 0) {
    // Create or get "Uncategorized" category
    let uncategorizedCategory = await prisma.category.findFirst({
      where: {
        slug: 'uncategorized',
        type: 'PRODUCT'
      }
    });

    if (!uncategorizedCategory) {
      uncategorizedCategory = await prisma.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
          type: 'PRODUCT',
          description: 'Products without a specific category'
        }
      });
    }

    // Move all products to uncategorized category
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: uncategorizedCategory.id }
    });
  }

  // Now delete the category
  await prisma.category.delete({ where: { id } });

  sendResponse(res, 200, true, `Category deleted successfully. ${productsCount} products moved to Uncategorized.`);
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};