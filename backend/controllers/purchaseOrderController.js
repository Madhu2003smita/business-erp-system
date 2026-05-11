const PurchaseOrder = require("../models/PurchaseOrder");
const Vendor = require("../models/Vendor");
const InventoryItem = require("../models/InventoryItem");
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

// Mark a Purchase Order as delivered and update inventory quantities
exports.deliverPurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId || null;

    const po = await PurchaseOrder.findOne({ _id: id, ...(tenantId ? { tenantId } : {}) });
    if (!po) return sendError(res, "Purchase order not found", 404);

    if (po.status === "delivered") {
      return sendError(res, "Purchase order already delivered", 400);
    }

    // For each item in the PO, find inventory by SKU (preferred) or name and increment quantity
    const items = Array.isArray(po.items) ? po.items : [];
    for (const it of items) {
      const itemQty = Number(it.quantity || 0);
      if (itemQty <= 0) continue;

      const filter = { ...(tenantId ? { tenantId } : {}) };
      if (it.sku) filter.sku = it.sku;
      else if (it.name) filter.name = it.name;
      else continue; // nothing to match on

      const inv = await InventoryItem.findOne(filter);
      if (inv) {
        inv.quantity = (inv.quantity || 0) + itemQty;
        await inv.save();
      } else {
        // If inventory item doesn't exist, create it so stock reflects delivery
        await InventoryItem.create({
          name: it.name || (it.sku ? it.sku : "Unnamed Item"),
          sku: it.sku || `OLD-PO-ITEM-${Date.now()}`,
          quantity: itemQty,
          reorderThreshold: 0,
          unitPrice: Number(it.unitPrice || 0) || 0,
          warehouse: it.warehouse || "",
          tenantId,
        });
      }
    }

    po.status = "delivered";
    po.deliveredAt = new Date();
    await po.save();

    const populated = await PurchaseOrder.findById(po._id).populate("vendorId", "name email phone status");
    return sendSuccess(res, "Purchase order delivered and inventory updated", populated);
  } catch (err) {
    next(err);
  }
};

