const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');


exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Missing fields", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user"
    });

    await user.save();

    sendSuccess(res, "User registered successfully", null, 201);

  } catch (error) {
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return sendError(res, "User not found", 404);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, "Invalid password", 401);

    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    sendSuccess(res, "Login successful", { token, role: user.role });

  } catch (error) {
    next(error);
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, "Current password and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, "New password must be at least 6 characters", 400);
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return sendError(res, "User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return sendError(res, "Current password is incorrect", 401);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendSuccess(res, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};
