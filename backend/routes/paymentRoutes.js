const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protected route: Only logged-in Admins can record payments
/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Record a payment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - amount
 *               - method
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *               amount:
 *                 type: number
 *                 example: 1500
 *               method:
 *                 type: string
 *                 example: bank-transfer
 *               reference:
 *                 type: string
 *                 example: TRX-99221
 *     responses:
 *       201:
 *         description: Payment recorded successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Invoice not found.
 */
router.post('/', authMiddleware, roleMiddleware('admin'), createPayment);

module.exports = router;