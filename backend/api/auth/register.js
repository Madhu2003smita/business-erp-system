const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Use the User model defined in server.js
const User = mongoose.model("User");

// Endpoint: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Error Case: Missing fields 
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Missing fields",
                error: "Name, email, and password are required"
            });
        }

        // 2. Error Case: Invalid email format 
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
                error: "Please provide a valid email address"
            });
        }

        // 3. Error Case: Password length (Security Best Practice) [cite: 173]
        if (password.length < 6) {
            return res.status(400).json({
                message: "Invalid password",
                error: "Password must be at least 6 characters long"
            });
        }

        // 4. Error Case: Email already exists 
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
                error: "This email is already registered in the system"
            });
        }

        // 5. Hash password using bcrypt before saving 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Store user data in MongoDB 
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Success Response 
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        // General Server Error Case [cite: 183]
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;

