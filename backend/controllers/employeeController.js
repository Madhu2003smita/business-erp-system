const Employee = require("../models/Employee");
const { sendSuccess, sendError } = require("../utils/response");

// CREATE
exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, designation, salary, joiningDate, status, tenantId } = req.body;

    if (!name || !email) return sendError(res, "Name and email are required", 400);

    const existing = await Employee.findOne({ email });
    if (existing) return sendError(res, "Employee with this email already exists", 400);

    const employee = await Employee.create({
      name,
      email,
      department: department || null,
      designation,
      salary,
      joiningDate,
      status,
      tenantId: tenantId || null,
      createdBy: req.user.id,
    });

    sendSuccess(res, "Employee created successfully", employee, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ isDeleted: false })
      .populate("department", "name")
      .populate("tenantId", "name domain")
      .populate("createdBy", "name email");
    sendSuccess(res, "Employees fetched successfully", employees);
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false })
      .populate("department", "name")
      .populate("tenantId", "name domain")
      .populate("createdBy", "name email");
    if (!employee) return sendError(res, "Employee not found", 404);
    sendSuccess(res, "Employee fetched successfully", employee);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return sendError(res, "Employee not found", 404);
    sendSuccess(res, "Employee updated successfully", employee);
  } catch (err) {
    next(err);
  }
};

// SOFT DELETE
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!employee) return sendError(res, "Employee not found", 404);
    sendSuccess(res, "Employee deleted successfully");
  } catch (err) {
    next(err);
  }
};
