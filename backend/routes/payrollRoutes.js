const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { runPayroll, getAllPayroll, getPayrollByEmployee } = require("../controllers/payrollController");

// Run payroll — admin only
router.post("/run", authMiddleware, roleMiddleware("admin"), runPayroll);

// Get all payroll records
router.get("/", authMiddleware, getAllPayroll);

// Get payroll history for one employee
router.get("/:employeeId", authMiddleware, getPayrollByEmployee);

module.exports = router;
