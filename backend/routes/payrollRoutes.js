const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { runPayroll, getAllPayroll, getPayrollByEmployee } = require("../controllers/payrollController");

// Run payroll — admin only
/**
 * @swagger
 * /api/payroll/run:
 *   post:
 *     tags:
 *       - Payroll
 *     summary: Run payroll for the current period.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *               payDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-31
 *     responses:
 *       201:
 *         description: Payroll run started successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/run", authMiddleware, roleMiddleware("admin"), runPayroll);

// Get payroll records (admin: tenant-wide, employee: own payslips only)
/**
 * @swagger
 * /api/payroll:
 *   get:
 *     tags:
 *       - Payroll
 *     summary: List payroll records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll records retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAllPayroll);

// Get payroll history for one employee (admin only)
/**
 * @swagger
 * /api/payroll/{employeeId}:
 *   get:
 *     tags:
 *       - Payroll
 *     summary: Get payroll history for an employee.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee identifier.
 *     responses:
 *       200:
 *         description: Payroll history retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Employee payroll history not found.
 */
router.get("/:employeeId", authMiddleware, roleMiddleware("admin"), getPayrollByEmployee);

module.exports = router;
