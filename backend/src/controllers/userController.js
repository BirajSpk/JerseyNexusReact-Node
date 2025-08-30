const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse, getPagination } = require('../utils/helpers');

const prisma = new PrismaClient();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const { skip, take } = getPagination(page, limit);

  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            blogs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  sendResponse(res, 200, true, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          product: {
            select: {
              name: true,
              slug: true
            }
          },
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
          blogs: true
        }
      }
    }
  });

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  sendResponse(res, 200, true, 'User retrieved successfully', { user });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    return sendResponse(res, 400, false, 'Invalid role. Must be USER or ADMIN');
  }

  // Prevent admin from changing their own role
  if (id === req.user.id) {
    return sendResponse(res, 400, false, 'You cannot change your own role');
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  });

  sendResponse(res, 200, true, 'User role updated successfully', { user: updatedUser });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user.id) {
    return sendResponse(res, 400, false, 'You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  await prisma.user.delete({
    where: { id }
  });

  sendResponse(res, 200, true, 'User deleted successfully');
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalAdmins,
    recentUsers,
    usersByMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM users 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month DESC
    `
  ]);

  const stats = {
    totalUsers,
    totalAdmins,
    totalRegularUsers: totalUsers - totalAdmins,
    recentUsers,
    usersByMonth
  };

  sendResponse(res, 200, true, 'User statistics retrieved successfully', { stats });
});

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats,
};