const { body } = require("express-validator");

const registerRules = [
  body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("name").optional().trim().isLength({ max: 120 }),
];

const loginRules = [
  body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

const forgotPasswordRules = [
  body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
];

const resetPasswordRules = [
  body("token").notEmpty().withMessage("Reset token is required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules };
