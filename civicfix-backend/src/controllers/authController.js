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

    console.log("Plain Password:", password);
    console.log("Hashed Password:", hashedPassword);

    const testMatch = await bcrypt.compare(password, hashedPassword);
    console.log("Immediate Compare:", testMatch);

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
    const adminKey = process.env.ADMIN_REGISTRATION_KEY;

    if (process.env.NODE_ENV === 'production' && !adminKey) {
      return errorResponse(res, 'Admin registration disabled', ['ADMIN_REGISTRATION_KEY must be configured'], 403);
    }

    if (adminKey && req.headers['x-admin-registration-key'] !== adminKey) {
      return errorResponse(res, 'Admin registration disabled', ['A valid admin registration key is required'], 403);
    }

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

    console.log("\n========== LOGIN REQUEST ==========");
    console.log("Request Body:", req.body);

    const user = await User.findOne({ email }).select("+password");

    console.log("User Found:", user);

    if (!user) {
      console.log("❌ User not found");
      return errorResponse(
        res,
        "Invalid credentials",
        ["Email or password is incorrect"],
        401
      );
    }

    console.log("Entered Password:", password);
    console.log("Stored Password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return errorResponse(
        res,
        "Invalid credentials",
        ["Email or password is incorrect"],
        401
      );
    }

    if (role && !isAllowedRole(user.role, role)) {
      console.log("❌ Role mismatch");
      return errorResponse(
        res,
        "Role mismatch",
        [getRoleMismatchMessage(role)],
        403
      );
    }

    const token = signToken({
      id: user._id,
      role: user.role,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    console.log("✅ Login Successful");
    console.log("===================================\n");

    return successResponse(res, "Login successful", {
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("🔥 Login Error:", error);
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
