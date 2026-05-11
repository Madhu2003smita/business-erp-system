const InventoryItem = require('../models/InventoryItem');
const { sendSuccess, sendError } = require('../utils/response');

// Add a new inventory item
exports.addInventoryItem = async (req, res, next) => {
  try {
    const { name, sku, reorderThreshold, unitPrice, quantity = 0, warehouse = '' } = req.body;
    if (!name || !sku || reorderThreshold === undefined || unitPrice === undefined) {
      return sendError(res, 'Missing fields', 400);
    }

    const tenantId = req.user.tenantId;

    // Check SKU uniqueness within tenant
    const existing = await InventoryItem.findOne({ tenantId, sku });
    if (existing) return sendError(res, 'SKU already exists', 400);

    const item = await InventoryItem.create({
      name,
      sku,
      quantity,
      reorderThreshold,
      unitPrice,
      warehouse,
      tenantId,
    });

    return sendSuccess(res, 'Inventory item created', item, 201);
  } catch (err) {
    next(err);
  }
};

// Get all inventory items for tenant
exports.getInventory = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const items = await InventoryItem.find({ tenantId });
    return sendSuccess(res, 'Inventory fetched successfully', items);
  } catch (err) {
    next(err);
  }
};

// Get low stock items (quantity <= reorderThreshold)
exports.getLowStock = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const items = await InventoryItem.find({
      tenantId,
      $expr: { $lte: ['$quantity', '$reorderThreshold'] },
    });
    return sendSuccess(res, 'Low stock items fetched successfully', items);
  } catch (err) {
    next(err);
  }
};

// Update an inventory item
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    // If SKU is being updated, ensure uniqueness within tenant
    if (req.body.sku) {
      const existing = await InventoryItem.findOne({
        tenantId,
        sku: req.body.sku,
        _id: { $ne: id },
      });
      if (existing) return sendError(res, 'SKU already exists', 400);
    }

    const updated = await InventoryItem.findOneAndUpdate(
      { _id: id, tenantId },
      req.body,
      { new: true }
    );

    if (!updated) return sendError(res, 'Inventory item not found', 404);

    return sendSuccess(res, 'Inventory item updated successfully', updated);
  } catch (err) {
    next(err);
  }
};
