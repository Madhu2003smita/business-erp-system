const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection [cite: 145]
mongoose.connect("mongodb://127.0.0.1:27017/erp-db")
  .then(() => console.log("MongoDB connected "))
  .catch(err => console.log(err));

// Schema - Expanded for Task 1 Requirements [cite: 27, 48]
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// --- LINKING TASK 1 ROUTE ---
// Path: backend/api/auth/register.js
const authRoutes = require('./api/auth/register');
app.use('/api/auth', authRoutes); 

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