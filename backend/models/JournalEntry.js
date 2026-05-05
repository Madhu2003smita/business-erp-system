const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    debitAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Debit account is required"],
    },
    creditAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Credit account is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    exchangeRate: {
      type: Number,
      default: 1,
      min: [0, "Exchange rate must be positive"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Entry date is required"],
      default: Date.now,
    },
    period: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "posted", "reversed"],
      default: "posted",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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


journalEntrySchema.pre("save", async function () {
  if (!this.entryNumber) {
    const count = await mongoose.model("JournalEntry").countDocuments();
    this.entryNumber = `JE-${String(count + 1).padStart(5, "0")}`;
  }
});

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
