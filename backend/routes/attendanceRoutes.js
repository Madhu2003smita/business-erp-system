const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  clockIn,
  clockOut,
  getAttendance,
} = require("../controllers/attendanceController");

// Attendance routes
/**
 * @swagger
 * /api/attendance/clock-in:
 *   post:
 *     tags:
 *       - Attendance
 *     summary: Clock in the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clock-in recorded successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.post("/clock-in", authMiddleware, clockIn);
/**
 * @swagger
 * /api/attendance/clock-out:
 *   post:
 *     tags:
 *       - Attendance
 *     summary: Clock out the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clock-out recorded successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.post("/clock-out", authMiddleware, clockOut);
/**
 * @swagger
 * /api/attendance:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get attendance records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAttendance);

module.exports = router;
