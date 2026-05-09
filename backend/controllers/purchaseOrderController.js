const PurchaseOrder = require("../models/PurchaseOrder");
const Vendor = require("../models/Vendor");
const { sendSuccess, sendError } = require("../utils/response");

exports.getAllPurchaseOrders = async (req, res, next) => {
  try {
    const filter = { isDeleted: false };
    if (req.user?.tenantId) filter.tenantId = req.user.tenantId;

    const pos = await PurchaseOrder.find(filter)
      .populate("vendorId", "name email phone status")
      .sort({ createdAt: -1 });

    sendSuccess(res, "Purchase orders fetched successfully", pos);
  } catch (err) {
    next(err);
  }
};

exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendorId, items, amount, status, deliveryDate } = req.body;

    if (!vendorId || !items || !deliveryDate) {
      return sendError(res, "vendorId, items and deliveryDate are required", 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, "At least one item is required", 400);
    }

    const tenantId = req.user?.tenantId || null;

    const vendor = await Vendor.findOne({ _id: vendorId, isDeleted: false, ...(tenantId ? { tenantId } : {}) });
    if (!vendor) return sendError(res, "Vendor not found", 404);

    const calculatedAmount = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);
    const finalAmount = amount !== undefined ? Number(amount) : calculatedAmount;
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) return sendError(res, "Amount must be greater than 0", 400);

    const last = await PurchaseOrder.findOne({ ...(tenantId ? { tenantId } : {}) }).sort({ createdAt: -1 });
    let poNumber = "PO-00001";
    if (last?.poNumber) {
      const match = String(last.poNumber).match(/PO-(\d+)/);
      if (match) {
        poNumber = `PO-${(parseInt(match[1], 10) + 1).toString().padStart(5, "0")}`;
      }
    }

    const po = await PurchaseOrder.create({
      poNumber,
      vendorId,
      items,
      amount: finalAmount,
      status: status || "pending",
      deliveryDate,
      tenantId,
      createdBy: req.user?.id || null,
    });

    const populated = await PurchaseOrder.findById(po._id).populate("vendorId", "name email phone status");
    sendSuccess(res, "Purchase order created successfully", populated, 201);
  } catch (err) {
    next(err);
  }
};

