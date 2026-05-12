const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllPurchaseOrders, createPurchaseOrder, deliverPurchaseOrder } = require("../controllers/purchaseOrderController");

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     tags:
 *       - Purchase Orders
 *     summary: List purchase orders.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase orders retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAllPurchaseOrders);
/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     tags:
 *       - Purchase Orders
 *     summary: Create a purchase order.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - items
 *             properties:
 *               vendorId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *               orderDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-12
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-20
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Printer toner
 *                     quantity:
 *                       type: number
 *                       example: 12
 *                     unitPrice:
 *                       type: number
 *                       example: 45
 *     responses:
 *       201:
 *         description: Purchase order created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/", authMiddleware, roleMiddleware("admin"), createPurchaseOrder);
/**
 * @swagger
 * /api/purchase-orders/{id}/deliver:
 *   patch:
 *     tags:
 *       - Purchase Orders
 *     summary: Mark a purchase order as delivered.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order identifier.
 *     responses:
 *       200:
 *         description: Purchase order marked as delivered successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Purchase order not found.
 */
router.patch("/:id/deliver", authMiddleware, roleMiddleware("admin"), deliverPurchaseOrder);

module.exports = router;

