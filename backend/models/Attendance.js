const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    clockIn: {
      type: Date,
      default: null,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    hoursWorked: {
      type: Number,
      default: 0,
      min: [0, "Hours worked cannot be negative"],
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
