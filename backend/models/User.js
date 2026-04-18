const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    }
  },
  {
    timestamps: true 
  }
);

module.exports = mongoose.model("User", userSchema);