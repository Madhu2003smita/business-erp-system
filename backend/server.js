require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection [cite: 145]
const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp-db";
mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

// Schema - Expanded for Task 1 Requirements [cite: 27, 48]
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
app.use("/api/auth", authRoutes);

// --- EXISTING TEAM ROUTES (DO NOT MODIFY) ---

// READ — any authenticated user
app.get("/api/users", authMiddleware, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// CREATE — admin only
app.post("/api/users", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const newUser = new User({
    name: req.body.name,
  });
  await newUser.save();
  res.json(newUser);
});

// DELETE — admin only
app.delete("/api/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// UPDATE — admin only
app.put("/api/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
  });
  res.json({ message: "User updated" });
});

// Start server [cite: 65]
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
