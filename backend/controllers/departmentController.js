const Department = require("../models/Department");
const { sendSuccess, sendError } = require("../utils/response");

// CREATE
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, tenantId } = req.body;

    if (!name) return sendError(res, "Department name is required", 400);

    const department = await Department.create({
      name,
      description,
      tenantId: tenantId || null,
      createdBy: req.user.id,
    });

    sendSuccess(res, "Department created successfully", department, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isDeleted: false })
      .populate("tenantId", "name domain")
      .populate("createdBy", "name email");
    sendSuccess(res, "Departments fetched successfully", departments);
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, isDeleted: false })
      .populate("tenantId", "name domain")
      .populate("createdBy", "name email");
    if (!department) return sendError(res, "Department not found", 404);
    sendSuccess(res, "Department fetched successfully", department);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return sendError(res, "Department not found", 404);
    sendSuccess(res, "Department updated successfully", department);
  } catch (err) {
    next(err);
  }
};

// SOFT DELETE
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!department) return sendError(res, "Department not found", 404);
    sendSuccess(res, "Department deleted successfully");
  } catch (err) {
    next(err);
  }
};
