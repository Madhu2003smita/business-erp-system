require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp-db";

mongoose.connect(dbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("Database connection error:", err));

// Import Model
const User = require('./models/User');

//  Import Routes
const authRoutes = require('./routes/authRoutes');

//  Use Routes
app.use('/api/auth', authRoutes);



// READ
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

//  CREATE
app.post('/api/users', async (req, res) => {
  const newUser = new User({
    name: req.body.name
  });
  await newUser.save();
  res.json(newUser);
});

//  DELETE
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

//  UPDATE
app.put('/api/users/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    name: req.body.name
  });
  res.json({ message: "User updated" });
});

//  Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});