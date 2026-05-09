const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Leave type name is required"],
      trim: true,
    },
    maxDays: {
      type: Number,
      required: [true, "Max days is required"],
      min: [0, "Max days cannot be negative"],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
