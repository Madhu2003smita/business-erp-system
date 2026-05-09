const LeaveType = require("../models/LeaveType");
const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
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

    // Check if employee exists
    const employee = await Employee.findOne({ _id: employeeId, tenantId });
    if (!employee) {
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
      employee: employeeId,
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
      employee: employeeId,
      leaveType: leaveTypeId,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      tenantId,
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
