const JournalEntry = require("../models/JournalEntry");
const Account = require("../models/Account");
const Period = require("../models/Period");
const { sendSuccess, sendError } = require("../utils/response");

// CREATE JOURNAL ENTRY
exports.createJournalEntry = async (req, res, next) => {
  try {
    const {
      debitAccount,
      creditAccount,
      amount,
      currency,
      exchangeRate,
      description,
      date,
      period,
      tenantId,
    } = req.body;

    // Validate required fields
    if (!debitAccount || !creditAccount || !amount || !date) {
      return sendError(res, "debitAccount, creditAccount, amount and date are required", 400);
    }

    // Debit and credit must be different accounts
    if (debitAccount === creditAccount) {
      return sendError(res, "Debit and credit accounts must be different", 400);
    }

    // Validate debit account exists
    const debitAcc = await Account.findOne({ _id: debitAccount, isDeleted: false });
    if (!debitAcc) return sendError(res, "Debit account not found", 404);

    // Validate credit account exists
    const creditAcc = await Account.findOne({ _id: creditAccount, isDeleted: false });
    if (!creditAcc) return sendError(res, "Credit account not found", 404);

    // Period close check
    if (period) {
      const periodDoc = await Period.findById(period);
      if (!periodDoc) return sendError(res, "Period not found", 404);
      if (periodDoc.isClosed) {
        return sendError(res, "Period is closed. Cannot post entries to a closed period", 400);
      }
    }

    // Create journal entry
    const entry = new JournalEntry({
      debitAccount,
      creditAccount,
      amount,
      currency: currency || "USD",
      exchangeRate: exchangeRate || 1,
      description,
      date,
      period: period || null,
      tenantId: tenantId || null,
      createdBy: req.user.id,
      status: "posted",
    });

    await entry.save();

    // Auto-update account balances
    const debitTypes = ["asset", "expense"];
    const debitAmount = debitTypes.includes(debitAcc.type) ? amount : -amount;
    const creditAmount = debitTypes.includes(creditAcc.type) ? -amount : amount;

    await Account.findByIdAndUpdate(debitAccount, { $inc: { balance: debitAmount } });
    await Account.findByIdAndUpdate(creditAccount, { $inc: { balance: creditAmount } });

    const populated = await JournalEntry.findById(entry._id)
      .populate("debitAccount", "name code type")
      .populate("creditAccount", "name code type")
      .populate("createdBy", "name email");

    sendSuccess(res, "Journal entry posted successfully", populated, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL JOURNAL ENTRIES
exports.getAllJournalEntries = async (req, res, next) => {
  try {
    const filter = { isDeleted: false };

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    if (req.query.period) filter.period = req.query.period;
    if (req.query.status) filter.status = req.query.status;

    const entries = await JournalEntry.find(filter)
      .populate("debitAccount", "name code type")
      .populate("creditAccount", "name code type")
      .populate("period", "name startDate endDate")
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    sendSuccess(res, "Journal entries fetched successfully", entries);
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getJournalEntryById = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, isDeleted: false })
      .populate("debitAccount", "name code type balance")
      .populate("creditAccount", "name code type balance")
      .populate("period", "name startDate endDate isClosed")
      .populate("createdBy", "name email");

    if (!entry) return sendError(res, "Journal entry not found", 404);
    sendSuccess(res, "Journal entry fetched successfully", entry);
  } catch (err) {
    next(err);
  }
};

// SOFT DELETE
exports.deleteJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), status: "reversed" },
      { new: true }
    );
    if (!entry) return sendError(res, "Journal entry not found", 404);
    sendSuccess(res, "Journal entry reversed successfully");
  } catch (err) {
    next(err);
  }
};
