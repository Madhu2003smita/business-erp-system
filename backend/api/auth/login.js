const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = mongoose.model("User");

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input fields
        if (!email || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // 2. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // 4. Generate JWT token
        // Using the secret from your .env file
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'your_fallback_secret',
            { expiresIn: '1d' }
        );

        // 5. Success Response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;