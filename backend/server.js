require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const authMiddleware = require("./middleware/authMiddleware");
// Middleware
app.use(cors());
app.use(express.json());

require("dotenv").config();
// MongoDB Connection
const dbURI =
  process.env.MONGO_URI ||
  "mongodb+srv://tanzeela:zoQde4WbFDAWkwc3@cluster0.v5yab.mongodb.net/business-erp?appName=Cluster0";

mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

// Import Model
const User = require("./models/User");

//  Import Routes
const authRoutes = require("./routes/authRoutes");

//  Use Routes
app.use("/api/auth", authRoutes);

// Get all users
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// Get user by ID
app.get("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check valid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    // Check user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

//  CREATE
app.post("/api/users", authMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({
      name,
      email,
      password,
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  DELETE
app.delete("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  UPDATE
app.put("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
