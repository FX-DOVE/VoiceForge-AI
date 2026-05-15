const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach((err) => {
      formatted[err.path] = err.msg;
    });
    return sendError(res, "Please check your input and try again.", 422, formatted);
  }
  next();
}

module.exports = validate;
