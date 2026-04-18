require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection [cite: 145]
const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp-db";
mongoose.connect(dbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("Database connection error:", err));

// Schema - Expanded for Task 1 Requirements [cite: 27, 48]
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// --- TASK 1: REGISTER API ---
const registerRoutes = require('./api/auth/register');
app.use('/api/auth', registerRoutes);

// --- TASK 2: LOGIN API ---
const loginRoutes = require('./api/auth/login');
app.use('/api/auth', loginRoutes);
// --- EXISTING TEAM ROUTES (DO NOT MODIFY) ---

// READ
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// CREATE
app.post('/api/users', async (req, res) => {
  const newUser = new User({
    name: req.body.name
  });
  await newUser.save();
  res.json(newUser);
});

// DELETE
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// UPDATE
app.put('/api/users/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    name: req.body.name
  });
  res.json({ message: "User updated" });
});

// Start server [cite: 65]
app.listen(5000, () => {
  console.log("Server running on port 5000");
});