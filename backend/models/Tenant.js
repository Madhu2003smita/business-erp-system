const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tenant name is required"],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, "Domain is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    plan: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
