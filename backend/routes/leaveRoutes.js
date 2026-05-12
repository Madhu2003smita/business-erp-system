const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createLeaveType,
  getLeaveTypes,
  submitLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} = require("../controllers/leaveController");

// Leave Type routes
router.post("/", authMiddleware, roleMiddleware("admin"), createLeaveType);
router.post("/leave-types", authMiddleware, roleMiddleware("admin"), createLeaveType);
router.get("/leave-types", authMiddleware, getLeaveTypes);

// Leave Request routes
router.post("/request", authMiddleware, submitLeaveRequest);
router.get("/request/me", authMiddleware, getMyLeaveRequests);
router.get("/request", authMiddleware, roleMiddleware("admin"), getLeaveRequests);
router.patch("/request/:id/approve", authMiddleware, roleMiddleware("admin"), approveLeaveRequest);
router.patch("/request/:id/reject", authMiddleware, roleMiddleware("admin"), rejectLeaveRequest);

module.exports = router;
