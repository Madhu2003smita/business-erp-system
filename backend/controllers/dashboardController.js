const Employee = require("../models/Employee");
const Account = require("../models/Account");
const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const { sendSuccess, sendError } = require("../utils/response");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      revenueAccounts,
      openPOs,
      totalInvoices,
    ] = await Promise.all([
      // Total active employees
      Employee.countDocuments({ isDeleted: false, status: "active" }),

      // Revenue accounts — sum balances
      Account.find({ type: "revenue", isDeleted: false }),

      // Open POs — pending or approved
      PurchaseOrder.countDocuments({
        status: { $in: ["pending", "approved"] },
      }),

      // Total invoices
      Invoice.countDocuments({}),
    ]);

    // Sum revenue account balances
    const totalRevenue = revenueAccounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );

    sendSuccess(res, "Dashboard stats fetched successfully", {
      totalEmployees,
      totalRevenue,
      openPOs,
      activeProjects: 0, // Will be updated when project module is complete
      totalInvoices,
    });
  } catch (err) {
    next(err);
  }
};
