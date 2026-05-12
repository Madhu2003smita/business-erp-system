const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { sendSuccess, sendError } = require("../utils/response");


/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health and database connectivity.
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy.
 *       503:
 *         description: Service unavailable because the database is disconnected.
 */
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
