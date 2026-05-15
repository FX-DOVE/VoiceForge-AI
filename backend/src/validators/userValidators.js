const { body } = require("express-validator");

const updateProfileRules = [
  body("name").optional().trim().isLength({ max: 120 }),
  body("avatarUrl").optional().isURL().withMessage("Avatar must be a valid URL."),
];

module.exports = { updateProfileRules };
