function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || res.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server error"
  });
}

module.exports = { notFound, errorHandler };
