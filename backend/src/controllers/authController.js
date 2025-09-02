const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/auth');
const { asyncHandler, sendResponse, generateSlug } = require('../utils/helpers');
const { prisma, executeWithRetry } = require('../config/database');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  console.table(req.body);
  // Validate required fields
  if (!name || !email || !password) {
    return sendResponse(res, 400, false, 'Name, email, and password are required');
  }

  // Validate password confirmation if provided
  if (confirmPassword && password !== confirmPassword) {
    return sendResponse(res, 400, false, 'Password confirmation does not match password');
  }

  // Validate email format
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return sendResponse(res, 400, false, 'Please provide a valid email address');
  }

  // Validate password length
  if (password.length < 6) {
    return sendResponse(res, 400, false, 'Password must be at least 6 characters long');
  }

  // Validate name length
  if (name.trim().length < 2 || name.trim().length > 50) {
    return sendResponse(res, 400, false, 'Name must be between 2 and 50 characters');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return sendResponse(res, 400, false, 'User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    }
  });

  // Generate token
  const token = generateToken(user.id);

  sendResponse(res, 201, true, 'User registered successfully', {
    user,
    token
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return sendResponse(res, 400, false, 'Email and password are required');
  }

  // Validate email format
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return sendResponse(res, 400, false, 'Please provide a valid email address');
  }

  // Validate password is not empty
  if (password.trim().length === 0) {
    return sendResponse(res, 400, false, 'Password cannot be empty');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }

  // Check password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  sendResponse(res, 200, true, 'Login successful', {
    user: userWithoutPassword,
    token
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  sendResponse(res, 200, true, 'Profile retrieved successfully', { user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar } = req.body;

  // Check if email is already taken by another user
  if (email && email !== req.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return sendResponse(res, 400, false, 'Email is already taken');
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (avatar) updateData.avatar = avatar;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  sendResponse(res, 200, true, 'Profile updated successfully', { user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  // Check current password
  const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordCorrect) {
    return sendResponse(res, 400, false, 'Current password is incorrect');
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword }
  });

  sendResponse(res, 200, true, 'Password changed successfully');
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a real-world app, you might want to implement token blacklisting
  // For now, we'll just send a success response as the client will remove the token
  sendResponse(res, 200, true, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};