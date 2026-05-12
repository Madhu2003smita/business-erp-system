const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllVendors, createVendor } = require("../controllers/vendorController");

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: List vendors.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAllVendors);
/**
 * @swagger
 * /api/vendors:
 *   post:
 *     tags:
 *       - Vendors
 *     summary: Create a vendor.
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Global Supplies Ltd
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sales@globalsupplies.com
 *               phone:
 *                 type: string
 *                 example: +1-555-0100
 *               address:
 *                 type: string
 *                 example: 10 Market Street, New York, NY
 *               taxId:
 *                 type: string
 *                 example: TAX-991122
 *     responses:
 *       201:
 *         description: Vendor created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/", authMiddleware, roleMiddleware("admin"), createVendor);

module.exports = router;

