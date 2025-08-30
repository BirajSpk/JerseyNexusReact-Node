const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' }
  });

  sendResponse(res, 200, true, 'Reviews retrieved successfully', { reviews });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;
  
  // Check if user has already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } }
  });
  
  if (existingReview) {
    return sendResponse(res, 400, false, 'You have already reviewed this product');
  }
  
  const review = await prisma.review.create({
    data: { userId, productId, rating, comment },
    include: { user: { select: { name: true, avatar: true } } }
  });

  sendResponse(res, 201, true, 'Review created successfully', { review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const review = await prisma.review.findUnique({ where: { id } });
  
  if (!review) {
    return sendResponse(res, 404, false, 'Review not found');
  }
  
  // Check if user owns the review or is admin
  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return sendResponse(res, 403, false, 'Not authorized to delete this review');
  }
  
  await prisma.review.delete({ where: { id } });
  
  sendResponse(res, 200, true, 'Review deleted successfully');
});

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};