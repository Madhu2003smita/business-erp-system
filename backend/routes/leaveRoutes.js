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
/**
 * @swagger
 * /api/leaves:
 *   post:
 *     tags:
 *       - Leave Management
 *     summary: Create a leave type.
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
 *                 example: Annual Leave
 *               daysAllowed:
 *                 type: number
 *                 example: 20
 *               paid:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Leave type created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/", authMiddleware, roleMiddleware("admin"), createLeaveType);
/**
 * @swagger
 * /api/leaves/leave-types:
 *   post:
 *     tags:
 *       - Leave Management
 *     summary: Create a leave type.
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
 *                 example: Annual Leave
 *               daysAllowed:
 *                 type: number
 *                 example: 20
 *               paid:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Leave type created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/leave-types", authMiddleware, roleMiddleware("admin"), createLeaveType);
/**
 * @swagger
 * /api/leaves/leave-types:
 *   get:
 *     tags:
 *       - Leave Management
 *     summary: List leave types.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave types retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/leave-types", authMiddleware, getLeaveTypes);

// Leave Request routes
/**
 * @swagger
 * /api/leaves/request:
 *   post:
 *     tags:
 *       - Leave Management
 *     summary: Submit a leave request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveTypeId
 *               - startDate
 *               - endDate
 *             properties:
 *               leaveTypeId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-05
 *               reason:
 *                 type: string
 *                 example: Family travel
 *     responses:
 *       201:
 *         description: Leave request submitted successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.post("/request", authMiddleware, submitLeaveRequest);
/**
 * @swagger
 * /api/leaves/request/me:
 *   get:
 *     tags:
 *       - Leave Management
 *     summary: Get the authenticated user's leave requests.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/request/me", authMiddleware, getMyLeaveRequests);
/**
 * @swagger
 * /api/leaves/request:
 *   get:
 *     tags:
 *       - Leave Management
 *     summary: List leave requests.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.get("/request", authMiddleware, roleMiddleware("admin"), getLeaveRequests);
/**
 * @swagger
 * /api/leaves/request/{id}/approve:
 *   patch:
 *     tags:
 *       - Leave Management
 *     summary: Approve a leave request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request identifier.
 *     responses:
 *       200:
 *         description: Leave request approved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Leave request not found.
 */
router.patch("/request/:id/approve", authMiddleware, roleMiddleware("admin"), approveLeaveRequest);
/**
 * @swagger
 * /api/leaves/request/{id}/reject:
 *   patch:
 *     tags:
 *       - Leave Management
 *     summary: Reject a leave request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request identifier.
 *     responses:
 *       200:
 *         description: Leave request rejected successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Leave request not found.
 */
router.patch("/request/:id/reject", authMiddleware, roleMiddleware("admin"), rejectLeaveRequest);

module.exports = router;
