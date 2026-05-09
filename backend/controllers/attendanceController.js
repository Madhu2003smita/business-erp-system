const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Employee = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

// CLOCK IN
exports.clockIn = async (req, res, next) => {
  try {
    const employeeId = req.user.id;

    const tenantId = req.user.tenantId;

    // Check if employee exists
    const employee = await User.findOne({ _id: employeeId, tenantId });
    if (!employee) {
      return sendError(res, "Employee not found", 404);
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already clocked in today
    const existingClockIn = await Attendance.findOne({
      employee: employeeId,
      tenantId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingClockIn) {
      return sendError(res, "Already clocked in today", 400);
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      clockIn: new Date(),
      status: "present",
      tenantId,
    });

    sendSuccess(res, "Clocked in successfully", attendance, 201);
  } catch (err) {
    next(err);
  }
};

// CLOCK OUT
exports.clockOut = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return sendError(res, "Employee ID is required", 400);
    }

    const tenantId = req.user.tenantId;

    // Check if employee exists
    const employee = await User.findOne({ _id: employeeId, tenantId });
    if (!employee) {
      return sendError(res, "Employee not found", 404);
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find active clock-in for today
    const attendance = await Attendance.findOne({
      employee: employeeId,
      tenantId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
      clockIn: { $ne: null },
      clockOut: null,
    });

    if (!attendance) {
      return sendError(res, "No active clock-in found", 400);
    }

    // Set clock out time
    const clockOutTime = new Date();
    attendance.clockOut = clockOutTime;

    // Calculate hours worked
    const hoursWorked =
      (clockOutTime - attendance.clockIn) / (1000 * 60 * 60);
    attendance.hoursWorked = parseFloat(hoursWorked.toFixed(2));

    await attendance.save();

    sendSuccess(res, "Clocked out successfully", attendance);
  } catch (err) {
    next(err);
  }
};

// GET ATTENDANCE RECORDS
exports.getAttendance = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    const attendance = await Attendance.find({ tenantId })
      .populate("employee", "name email");

    sendSuccess(res, "Attendance records fetched successfully", attendance);
  } catch (err) {
    next(err);
  }
};
