const bcrypt = require('bcryptjs');
const { asyncHandler, sendResponse, getPagination } = require('../utils/helpers');
const WebSocketService = require('../utils/websocket');
const { prisma, executeWithRetry } = require('../config/database');

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

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role = 'USER', status = 'ACTIVE' } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return sendResponse(res, 400, false, 'User with this email already exists');
  }

  // Create user with default password (they should change it)
  const defaultPassword = 'password123'; // In production, generate a random password and send via email
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      status
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    }
  });

  sendResponse(res, 201, true, 'User created successfully', { user });
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    return sendResponse(res, 404, false, 'User not found');
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });

    if (emailExists) {
      return sendResponse(res, 400, false, 'Email already in use');
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (status) updateData.status = status;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  sendResponse(res, 200, true, 'User updated successfully', { user });
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, address, avatar } = req.body;

  // Check if email is already taken by another user
  if (email && email !== req.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return sendResponse(res, 400, false, 'Email already taken');
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = JSON.stringify(address);
  if (avatar) updateData.avatar = avatar;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  // Emit profile update via WebSocket
  WebSocketService.emitProfileUpdate(userId, updatedUser);

  sendResponse(res, 200, true, 'Profile updated successfully', { user: updatedUser });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    }
  });

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  // Parse address if it exists
  if (user.address) {
    try {
      user.address = JSON.parse(user.address);
    } catch (error) {
      user.address = null;
    }
  }

  sendResponse(res, 200, true, 'Profile retrieved successfully', { user });
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!currentPassword || !newPassword) {
    return sendResponse(res, 400, false, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    return sendResponse(res, 400, false, 'New password must be at least 6 characters long');
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return sendResponse(res, 400, false, 'Current password is incorrect');
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  sendResponse(res, 200, true, 'Password updated successfully');
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getUserStats,
  updateProfile,
  getProfile,
  changePassword,
};