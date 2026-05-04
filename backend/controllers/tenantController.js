const Tenant = require("../models/Tenant");
const { sendSuccess, sendError } = require("../utils/response");

// CREATE
exports.createTenant = async (req, res, next) => {
  try {
    const { name, domain, plan } = req.body;

    if (!name || !domain) {
      return sendError(res, "Name and domain are required", 400);
    }

    const existing = await Tenant.findOne({ domain });
    if (existing) {
      return sendError(res, "Domain already exists", 400);
    }

    const tenant = await Tenant.create({ name, domain, plan });
    sendSuccess(res, "Tenant created successfully", tenant, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({ isDeleted: false });
    sendSuccess(res, "Tenants fetched successfully", tenants);
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false });
    if (!tenant) return sendError(res, "Tenant not found", 404);
    sendSuccess(res, "Tenant fetched successfully", tenant);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) return sendError(res, "Tenant not found", 404);
    sendSuccess(res, "Tenant updated successfully", tenant);
  } catch (err) {
    next(err);
  }
};

// SOFT DELETE
exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!tenant) return sendError(res, "Tenant not found", 404);
    sendSuccess(res, "Tenant deleted successfully");
  } catch (err) {
    next(err);
  }
};
