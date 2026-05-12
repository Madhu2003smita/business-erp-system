const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { sendSuccess, sendError } = require("../utils/response");

const TAX_RATE = 0.10; // 10% tax deduction

// RUN PAYROLL
exports.runPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const tenantId = req.user.tenantId;

    if (!month || !year) {
      return sendError(res, "Month and year are required", 400);
    }

    if (month < 1 || month > 12) {
      return sendError(res, "Month must be between 1 and 12", 400);
    }

    // Get all active employees for this tenant
    const employees = await Employee.find({
      tenantId,
      status: "active",
      isDeleted: false,
    });
    if (employees.length === 0) {
      return sendError(res, "No active employees found", 400);
    }

    // Get existing payroll records for this tenant and period
    const existingPayroll = await Payroll.find({ tenantId, month, year }).select("employee");
    const processedEmployeeIds = new Set(existingPayroll.map((p) => String(p.employee)));

    // Process only employees who do not yet have payroll for this period
    const unprocessedEmployees = employees.filter(
      (emp) => !processedEmployeeIds.has(String(emp._id))
    );

    if (unprocessedEmployees.length === 0) {
      return sendError(res, "Payroll already processed for all active employees", 400);
    }

    // Calculate payroll for each employee
    const payrollRecords = unprocessedEmployees.map((emp) => {
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
    const tenantId = req.user.tenantId;
    const filter = { tenantId };
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);

    // Non-admins can only view their own payslips
    if (req.user.role !== "admin") {
      const ownEmployee = await Employee.findOne({
        tenantId,
        email: req.user.email,
        isDeleted: false,
      }).select("_id");

      if (!ownEmployee) {
        return sendError(res, "Employee profile not found", 404);
      }

      filter.employee = ownEmployee._id;
    }

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
    const tenantId = req.user.tenantId;
    const employee = await Employee.findOne({
      _id: req.params.employeeId,
      tenantId,
      isDeleted: false,
    });
    if (!employee) return sendError(res, "Employee not found", 404);

    const records = await Payroll.find({
      tenantId,
      employee: req.params.employeeId,
    })
      .populate("employee", "name email designation")
      .sort({ year: -1, month: -1 });

    sendSuccess(res, "Employee payroll history fetched successfully", records);
  } catch (err) {
    next(err);
  }
};
