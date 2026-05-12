const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

// GET /api/dashboard/stats
/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/stats", authMiddleware, getDashboardStats);

module.exports = router;
