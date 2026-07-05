const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { isAllowedRole, getRoleMismatchMessage } = require('../utils/authRoles');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User already exists', ['Email is already registered'], 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'citizen',
    });

    const token = signToken({ id: user._id, role: user.role });

    const safeUser = user.toObject();
    delete safeUser.password;

    return successResponse(res, 'User registered successfully', { user: safeUser, token }, 201);
  } catch (error) {
    next(error);
  }
};

exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User already exists', ['Email is already registered'], 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'admin',
    });

    const token = signToken({ id: user._id, role: user.role });

    const safeUser = user.toObject();
    delete safeUser.password;

    return successResponse(res, 'Admin registered successfully', { user: safeUser, token }, 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', ['Email or password is incorrect'], 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', ['Email or password is incorrect'], 401);
    }

    if (role && !isAllowedRole(user.role, role)) {
      return errorResponse(res, 'Role mismatch', [getRoleMismatchMessage(role)], 403);
    }

    const token = signToken({ id: user._id, role: user.role });

    const safeUser = user.toObject();
    delete safeUser.password;

    return successResponse(res, 'Login successful', { user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    return successResponse(res, 'User profile fetched successfully', { user: req.user });
  } catch (error) {
    next(error);
  }
};
