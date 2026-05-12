const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { runPayroll, getAllPayroll, getPayrollByEmployee } = require("../controllers/payrollController");

// Run payroll — admin only
router.post("/run", authMiddleware, roleMiddleware("admin"), runPayroll);

// Get payroll records (admin: tenant-wide, employee: own payslips only)
router.get("/", authMiddleware, getAllPayroll);

// Get payroll history for one employee (admin only)
router.get("/:employeeId", authMiddleware, roleMiddleware("admin"), getPayrollByEmployee);

module.exports = router;
