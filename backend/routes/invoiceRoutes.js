const express = require('express');
const router = express.Router();
const { createInvoice, getAllInvoices, getAgingReport } = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protected routes: Only logged-in Admins can access these
/**
 * @swagger
 * /api/invoices:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: List invoices.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get('/', authMiddleware, getAllInvoices);
/**
 * @swagger
 * /api/invoices/aging-report:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: Get the invoice aging report.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aging report retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.get('/aging-report', authMiddleware, roleMiddleware('admin'), getAgingReport);
/**
 * @swagger
 * /api/invoices:
 *   post:
 *     tags:
 *       - Invoices
 *     summary: Create an invoice.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceNumber
 *               - customerName
 *               - items
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *                 example: INV-1001
 *               customerName:
 *                 type: string
 *                 example: Acme Traders
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-12
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-11
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Consulting services
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     unitPrice:
 *                       type: number
 *                       example: 500
 *     responses:
 *       201:
 *         description: Invoice created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post('/', authMiddleware, roleMiddleware('admin'), createInvoice);

module.exports = router;