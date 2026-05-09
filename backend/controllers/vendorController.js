const Vendor = require("../models/Vendor");
const { sendSuccess, sendError } = require("../utils/response");

exports.getAllVendors = async (req, res, next) => {
  try {
    const filter = { isDeleted: false };
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, "Vendors fetched successfully", vendors);
  } catch (err) {
    next(err);
  }
};

exports.createVendor = async (req, res, next) => {
  try {
    const { name, email, phone, address, status } = req.body;
    if (!name || !email || !phone || !address) {
      return sendError(res, "name, email, phone and address are required", 400);
    }

    const tenantId = req.user?.tenantId || null;
    const existing = await Vendor.findOne({
      email: String(email).toLowerCase().trim(),
      tenantId,
      isDeleted: false,
    });
    if (existing) return sendError(res, "Vendor with this email already exists", 400);

    const vendor = await Vendor.create({
      name,
      email,
      phone,
      address,
      status: status || "active",
      tenantId,
      createdBy: req.user?.id || null,
    });

    sendSuccess(res, "Vendor created successfully", vendor, 201);
  } catch (err) {
    next(err);
  }
};

