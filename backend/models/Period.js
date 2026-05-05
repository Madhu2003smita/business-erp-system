const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Period name is required"],
      trim: true,
      // e.g. "2026-01", "2026-Q1"
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Period", periodSchema);
