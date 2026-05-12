const Employee = require("../models/Employee");
const Account = require("../models/Account");
const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const Project = require("../models/Project"); // 1. Added Project Model
const { sendSuccess, sendError } = require("../utils/response");

exports.getDashboardStats = async (req, res, next) => {
  try {
    // 2. Grab the tenant ID from the logged-in user!
    const tenantId = req.user.tenantId; 

    const [
      totalEmployees,
      revenueAccounts,
      openPOs,
      totalInvoices,
      activeProjects // 3. Added to Promise.all
    ] = await Promise.all([
      // Total active employees FOR THIS TENANT
      Employee.countDocuments({ tenantId, isDeleted: false, status: "active" }),

      // Revenue accounts FOR THIS TENANT
      Account.find({ tenantId, type: "revenue", isDeleted: false }),

      // Open POs FOR THIS TENANT
      PurchaseOrder.countDocuments({
        tenantId,
        status: { $in: ["pending", "approved"] },
      }),

      // Total invoices FOR THIS TENANT
      Invoice.countDocuments({ tenantId }),

      // 4. Your new Project logic!
      Project.countDocuments({
        tenantId,
        status: "active",
        deletedAt: null 
      })
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
      activeProjects, // 5. Now dynamically using the database count!
      totalInvoices,
    });
  } catch (err) {
    next(err);
  }
};