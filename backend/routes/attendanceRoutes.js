const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  clockIn,
  clockOut,
  getAttendance,
} = require("../controllers/attendanceController");

// Attendance routes
router.post("/clock-in", authMiddleware, clockIn);
router.post("/clock-out", authMiddleware, clockOut);
router.get("/", authMiddleware, getAttendance);

module.exports = router;
