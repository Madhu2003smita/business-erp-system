const Period = require("../models/Period");
const { sendSuccess, sendError } = require("../utils/response");


exports.createPeriod = async (req, res, next) => {
  try {
    const { name, startDate, endDate, tenantId } = req.body;

    if (!name || !startDate || !endDate) {
      return sendError(res, "Name, startDate and endDate are required", 400);
    }

    const period = await Period.create({
      name,
      startDate,
      endDate,
      tenantId: tenantId || null,
    });

    sendSuccess(res, "Period created successfully", period, 201);
  } catch (err) {
    next(err);
  }
};


exports.getAllPeriods = async (req, res, next) => {
  try {
    const periods = await Period.find().sort({ startDate: -1 });
    sendSuccess(res, "Periods fetched successfully", periods);
  } catch (err) {
    next(err);
  }
};

exports.closePeriod = async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.id);
    if (!period) return sendError(res, "Period not found", 404);
    if (period.isClosed) return sendError(res, "Period is already closed", 400);

    period.isClosed = true;
    period.closedAt = new Date();
    period.closedBy = req.user.id;
    await period.save();

    sendSuccess(res, "Period closed successfully", period);
  } catch (err) {
    next(err);
  }
};
