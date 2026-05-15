function sendSuccess(res, data = {}, message = "Operation completed successfully.", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, message = "Something went wrong.", statusCode = 500, errors = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { sendSuccess, sendError };
