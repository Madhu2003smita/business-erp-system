const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protected route: Only logged-in Admins can record payments
router.post('/', authMiddleware, roleMiddleware('admin'), createPayment);

module.exports = router;