function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || "Server error";

  if (err.code === 11000) {
    status = 409;
    message = err.keyPattern?.email ? "An account with this email already exists" : "A record with this value already exists";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON request body";
  } else if (err.name === "ValidationError" || err.name === "CastError") {
    status = 422;
    message = "Validation failed";
  }

  const response = {
    success: false,
    message
  };
  if (err.details) response.errors = err.details;
  res.status(status).json(response);
}

module.exports = { notFound, errorHandler };
