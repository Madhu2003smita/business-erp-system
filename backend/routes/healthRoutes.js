const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { sendSuccess, sendError } = require("../utils/response");


router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;

  
  const dbStatus = dbState === 1 ? "connected" : "disconnected";

  if (dbState !== 1) {
    return sendError(
      res,
      "Service unavailable: database disconnected",
      503,
    );
  }

  sendSuccess(res, "Server is healthy", {
    status: "ok",
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
