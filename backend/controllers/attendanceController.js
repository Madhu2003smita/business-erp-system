const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { sendSuccess, sendError } = require("../utils/response");

// CLOCK IN
exports.clockIn = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    // Resolve employee ID safely: body -> employeeId in token -> email lookup
    let resolvedEmployeeId = req.body?.employeeId || req.user?.employeeId || null;

    if (!resolvedEmployeeId && req.user?.email) {
      const employeeByEmail = await Employee.findOne({
        email: req.user.email,
        tenantId,
        isDeleted: false,
      }).select("_id");

      if (employeeByEmail?._id) {
        resolvedEmployeeId = employeeByEmail._id;
      }
    }

    if (!resolvedEmployeeId) {
      return sendError(res, "Employee not found", 404);
    }

    // Check if employee exists under same tenant
    const employee = await Employee.findOne({
      _id: resolvedEmployeeId,
      tenantId,
      isDeleted: false,
    });
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
      employee: resolvedEmployeeId,
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
      employee: resolvedEmployeeId,
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
    const tenantId = req.user.tenantId;

    // Resolve to an Employee _id first, then fall back to the authenticated user id
    let resolvedEmployeeId = null;

    if (req.user?.email) {
      const employeeByEmail = await Employee.findOne({
        email: req.user.email,
        tenantId,
        isDeleted: false,
      }).select("_id");

      if (employeeByEmail?._id) {
        resolvedEmployeeId = employeeByEmail._id;
      }
    }

    if (!resolvedEmployeeId && req.user?.id) {
      const employeeByCreator = await Employee.findOne({
        createdBy: req.user.id,
        tenantId,
        isDeleted: false,
      }).select("_id");

      if (employeeByCreator?._id) {
        resolvedEmployeeId = employeeByCreator._id;
      }
    }

    if (!resolvedEmployeeId) {
      resolvedEmployeeId = req.body?.employeeId || req.user?.id || null;
    }

    if (!resolvedEmployeeId) {
      return sendError(res, "Employee not found", 404);
    }

    // Ensure resolved employee belongs to the same tenant
    const employee = await Employee.findOne({
      _id: resolvedEmployeeId,
      tenantId,
      isDeleted: false,
    });
    if (!employee) {
      return sendError(res, "Employee not found", 404);
    }

    // Build local start/end-of-day boundaries to avoid date mismatch issues
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Find today's active attendance (clockOut must be exactly null)
    const attendance = await Attendance.findOne({
      employee: resolvedEmployeeId,
      tenantId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      clockOut: null,
    });

    if (!attendance) {
      return sendError(res, "No active clock-in found for today.", 400);
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
    const isAdmin = req.user.role === "admin";

    const filter = { tenantId };

    // Standard employees can only view their own attendance records
    if (!isAdmin) {
      const ownEmployee = await Employee.findOne({
        tenantId,
        email: req.user.email,
        isDeleted: false,
      }).select("_id");

      if (!ownEmployee) {
        return sendError(res, "Employee profile not found", 404);
      }

      filter.employee = ownEmployee._id;
    }

    const attendance = await Attendance.find(filter).populate({
      path: "employee",
      select: "name email",
      model: "Employee",
    });

    sendSuccess(res, "Attendance records fetched successfully", attendance);
  } catch (err) {
    next(err);
  }
};
