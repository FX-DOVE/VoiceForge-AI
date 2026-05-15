const { sendError } = require("../utils/apiResponse");

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return sendError(res, "Invalid data provided.", 422, err.errors);
  }

  if (err.code === 11000) {
    return sendError(res, "This record already exists.", 409);
  }

  if (err.name === "MulterError") {
    return sendError(res, err.message || "File upload failed.", 400);
  }

  const status = err.statusCode || 500;
  const message =
    status === 500
      ? "Something went wrong on our end. Please try again later."
      : err.message;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  return sendError(res, message, status, err.errors || {});
}

module.exports = errorHandler;
