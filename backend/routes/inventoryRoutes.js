const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  addInventoryItem,
  getInventory,
  getLowStock,
  updateInventoryItem,
} = require('../controllers/inventoryController');

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Create an inventory item.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop Dock
 *               sku:
 *                 type: string
 *                 example: INV-DOCK-001
 *               quantity:
 *                 type: number
 *                 example: 25
 *               reorderLevel:
 *                 type: number
 *                 example: 10
 *               unitPrice:
 *                 type: number
 *                 example: 120.5
 *     responses:
 *       201:
 *         description: Inventory item created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post('/', authMiddleware, roleMiddleware('admin'), addInventoryItem);
/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: List inventory items.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get('/', authMiddleware, getInventory);
/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: List low-stock inventory items.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low-stock items retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.get('/low-stock', authMiddleware, roleMiddleware('admin'), getLowStock);
/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     tags:
 *       - Inventory
 *     summary: Update an inventory item.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop Dock
 *               sku:
 *                 type: string
 *                 example: INV-DOCK-001
 *               quantity:
 *                 type: number
 *                 example: 20
 *               reorderLevel:
 *                 type: number
 *                 example: 10
 *               unitPrice:
 *                 type: number
 *                 example: 125
 *     responses:
 *       200:
 *         description: Inventory item updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Inventory item not found.
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateInventoryItem);

module.exports = router;
