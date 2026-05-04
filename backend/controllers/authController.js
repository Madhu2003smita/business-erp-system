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
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    sendSuccess(res, "Login successful", { token, role: user.role });

  } catch (error) {
    next(error);
  }
};