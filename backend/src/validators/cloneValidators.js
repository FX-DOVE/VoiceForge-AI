const { body } = require("express-validator");

const configureCloneRules = [
  body("cloneId").notEmpty().withMessage("Clone ID is required."),
  body("name").trim().notEmpty().withMessage("Voice name is required.").isLength({ max: 80 }),
  body("description").optional().trim().isLength({ max: 500 }),
  body("visibility").optional().isIn(["private", "public", "unlisted"]),
];

const startCloneRules = [body("cloneId").notEmpty().withMessage("Clone ID is required.")];

module.exports = { configureCloneRules, startCloneRules };
