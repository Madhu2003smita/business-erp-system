const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    reorderThreshold: {
      type: Number,
      required: [true, 'Reorder threshold is required'],
      min: [0, 'Reorder threshold cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    warehouse: {
      type: String,
      trim: true,
      default: '',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure SKU is unique within a tenant
inventoryItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
