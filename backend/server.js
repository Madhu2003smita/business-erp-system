const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/erp-db")
  .then(() => console.log("MongoDB connected "))
  .catch(err => console.log(err));

//  Schema 
const userSchema = new mongoose.Schema({
  name: String
});

const User = mongoose.model("User", userSchema);

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

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});