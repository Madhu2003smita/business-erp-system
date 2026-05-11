const express = require('express');
const router = express.Router();

const { register, login, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.patch('/change-password', authMiddleware, changePassword);

module.exports = router;