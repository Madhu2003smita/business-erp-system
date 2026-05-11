const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { sendSuccess, sendError } = require("../utils/response");

const TAX_RATE = 0.10; // 10% tax deduction

// RUN PAYROLL
exports.runPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return sendError(res, "Month and year are required", 400);
    }

    if (month < 1 || month > 12) {
      return sendError(res, "Month must be between 1 and 12", 400);
    }

    // Check if payroll already run for this period
    const existing = await Payroll.findOne({ month, year });
    if (existing) {
      return sendError(res, "Payroll already processed for this period", 400);
    }

    // Get all active employees
    const employees = await Employee.find({ status: "active", isDeleted: false });
    if (employees.length === 0) {
      return sendError(res, "No active employees found", 400);
    }

    // Calculate payroll for each employee
    const payrollRecords = employees.map((emp) => {
      const basicSalary = emp.salary || 0;
      const deductions = basicSalary * TAX_RATE;
      const netSalary = basicSalary - deductions;

      return {
        employee: emp._id,
        month,
        year,
        basicSalary,
        deductions: parseFloat(deductions.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
        status: "processed",
        tenantId: emp.tenantId || null,
        processedBy: req.user.id,
      };
    });

    // Insert all payroll records
    const created = await Payroll.insertMany(payrollRecords);

    sendSuccess(res, `Payroll processed for ${created.length} employees`, {
      month,
      year,
      totalEmployees: created.length,
      records: created,
    }, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL PAYROLL
exports.getAllPayroll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);

    const records = await Payroll.find(filter)
      .populate("employee", "name email designation")
      .populate("processedBy", "name email")
      .sort({ year: -1, month: -1 });

    sendSuccess(res, "Payroll records fetched successfully", records);
  } catch (err) {
    next(err);
  }
};

// GET PAYROLL BY EMPLOYEE
exports.getPayrollByEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.employeeId, isDeleted: false });
    if (!employee) return sendError(res, "Employee not found", 404);

    const records = await Payroll.find({ employee: req.params.employeeId })
      .populate("employee", "name email designation")
      .sort({ year: -1, month: -1 });

    sendSuccess(res, "Employee payroll history fetched successfully", records);
  } catch (err) {
    next(err);
  }
};
