const Account = require("../models/Account");
const { sendSuccess, sendError } = require("../utils/response");


exports.createAccount = async (req, res, next) => {
  try {
    const { name, code, type, currency, tenantId } = req.body;

    if (!name || !code || !type) {
      return sendError(res, "Name, code and type are required", 400);
    }

    const existing = await Account.findOne({ code });
    if (existing) {
      return sendError(res, "Account code already exists", 400);
    }

    const account = await Account.create({
      name,
      code,
      type,
      currency: currency || "USD",
      tenantId: tenantId || null,
      createdBy: req.user.id,
    });

    sendSuccess(res, "Account created successfully", account, 201);
  } catch (err) {
    next(err);
  }
};


exports.getAllAccounts = async (req, res, next) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.type) filter.type = req.query.type;

    const accounts = await Account.find(filter)
      .populate("tenantId", "name domain")
      .populate("createdBy", "name email")
      .sort({ code: 1 });

    sendSuccess(res, "Accounts fetched successfully", accounts);
  } catch (err) {
    next(err);
  }
};


exports.getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, isDeleted: false })
      .populate("tenantId", "name domain")
      .populate("createdBy", "name email");

    if (!account) return sendError(res, "Account not found", 404);
    sendSuccess(res, "Account fetched successfully", account);
  } catch (err) {
    next(err);
  }
};


exports.updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) return sendError(res, "Account not found", 404);
    sendSuccess(res, "Account updated successfully", account);
  } catch (err) {
    next(err);
  }
};


exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!account) return sendError(res, "Account not found", 404);
    sendSuccess(res, "Account deleted successfully");
  } catch (err) {
    next(err);
  }
};
