const { sendError } = require("../utils/response");


const notFound = (req, res, next) => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
};


const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err.message);

  
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, "Validation failed", 400, errors);
  }

  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `${field} already exists`, 400);
  }

  
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }

  
  const statusCode = err.statusCode || 500;
  sendError(res, err.message || "Internal server error", statusCode);
};

module.exports = { notFound, errorHandler };
