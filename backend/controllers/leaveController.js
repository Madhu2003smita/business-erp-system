const LeaveType = require("../models/LeaveType");
const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const { sendSuccess, sendError } = require("../utils/response");

// CREATE LEAVE TYPE
exports.createLeaveType = async (req, res, next) => {
  try {
    const { name, maxDays } = req.body;

    if (!name || maxDays === undefined) {
      return sendError(res, "Name and maxDays are required", 400);
    }

    const tenantId = req.user.tenantId;

    const leaveType = await LeaveType.create({
      name,
      maxDays,
      tenantId,
    });

    sendSuccess(res, "Leave type created successfully", leaveType, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL LEAVE TYPES
exports.getLeaveTypes = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    const leaveTypes = await LeaveType.find({ tenantId });

    sendSuccess(res, "Leave types fetched successfully", leaveTypes);
  } catch (err) {
    next(err);
  }
};

// SUBMIT LEAVE REQUEST
exports.submitLeaveRequest = async (req, res, next) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason) {
      return sendError(res, "Missing required fields", 400);
    }

    const tenantId = req.user.tenantId;

    // Resolve employee identity securely:
    // 1) Use provided employeeId only if it is a valid ObjectId.
    // 2) Otherwise fall back to authenticated user's email + tenant.
    let resolvedEmployee = null;

    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      resolvedEmployee = await Employee.findOne({
        _id: employeeId,
        tenantId,
        isDeleted: false,
      }).select("_id");
    }

    if (!resolvedEmployee) {
      resolvedEmployee = await Employee.findOne({
        email: req.user.email,
        tenantId,
        isDeleted: false,
      }).select("_id");
    }

    // Check if employee exists
    if (!resolvedEmployee) {
      return sendError(res, "Employee not found", 404);
    }

    // Check if leave type exists
    const leaveType = await LeaveType.findOne({ _id: leaveTypeId, tenantId });
    if (!leaveType) {
      return sendError(res, "Leave type not found", 404);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total days
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leave requests
    const overlapping = await LeaveRequest.findOne({
      employee: resolvedEmployee._id,
      tenantId,
      status: "approved",
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return sendError(res, "Leave request overlaps existing request", 400);
    }

    const leaveRequest = await LeaveRequest.create({
      employee: resolvedEmployee._id,
      leaveType: leaveTypeId,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      tenantId: req.user.tenantId,
    });

    sendSuccess(res, "Leave request submitted successfully", leaveRequest, 201);
  } catch (err) {
    next(err);
  }
};

// GET ALL LEAVE REQUESTS (FOR TENANT)
exports.getLeaveRequests = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    const leaveRequests = await LeaveRequest.find({ tenantId })
      .populate("employee", "name email")
      .populate("leaveType", "name maxDays")
      .populate("approvedBy", "name email");

    sendSuccess(res, "Leave requests fetched successfully", leaveRequests);
  } catch (err) {
    next(err);
  }
};

// GET MY LEAVE REQUESTS (FOR AUTHENTICATED EMPLOYEE)
exports.getMyLeaveRequests = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    let employeeId = req.user.employeeId || null;

    if (!employeeId) {
      const ownEmployee = await Employee.findOne({
        tenantId,
        email: req.user.email,
        isDeleted: false,
      }).select("_id");

      if (!ownEmployee) {
        return sendError(res, "Employee profile not found", 404);
      }

      employeeId = ownEmployee._id;
    }

    const leaveRequests = await LeaveRequest.find({
      tenantId,
      employee: employeeId,
    })
      .populate("employee", "name email")
      .populate("leaveType", "name maxDays")
      .populate("approvedBy", "name email");

    sendSuccess(res, "My leave requests fetched successfully", leaveRequests);
  } catch (err) {
    next(err);
  }
};

// APPROVE LEAVE REQUEST
exports.approveLeaveRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return sendError(res, "Request ID is required", 400);
    }

    const tenantId = req.user.tenantId;

    const leaveRequest = await LeaveRequest.findOne({ _id: requestId, tenantId });
    if (!leaveRequest) {
      return sendError(res, "Leave request not found", 404);
    }

    if (leaveRequest.status !== "pending") {
      return sendError(res, "Request already processed", 400);
    }

    leaveRequest.status = "approved";
    leaveRequest.approvedBy = req.user.id;
    await leaveRequest.save();

    sendSuccess(res, "Leave request approved successfully", leaveRequest);
  } catch (err) {
    next(err);
  }
};

// REJECT LEAVE REQUEST
exports.rejectLeaveRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return sendError(res, "Request ID is required", 400);
    }

    const tenantId = req.user.tenantId;

    const leaveRequest = await LeaveRequest.findOne({ _id: requestId, tenantId });
    if (!leaveRequest) {
      return sendError(res, "Leave request not found", 404);
    }

    if (leaveRequest.status !== "pending") {
      return sendError(res, "Request already processed", 400);
    }

    leaveRequest.status = "rejected";
    leaveRequest.approvedBy = req.user.id;
    await leaveRequest.save();

    sendSuccess(res, "Leave request rejected successfully", leaveRequest);
  } catch (err) {
    next(err);
  }
};
