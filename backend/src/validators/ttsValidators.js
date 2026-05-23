const { body } = require("express-validator");

const generateTtsRules = [
  body("text").trim().notEmpty().withMessage("Text is required.").isLength({ max: 10000 }),
  body("voiceId").optional().trim(),
  body("voiceSlug").optional().trim(),
  body("language").optional().trim(),
  body("codec").optional().trim(),
  body("sampleRate").optional().isInt({ min: 8000, max: 48000 }),
  body("bitRate").optional().isInt({ min: 64000, max: 320000 }),
  body("speed").optional().isFloat({ min: 0.5, max: 2 }),
  body("stability").optional().isFloat({ min: 0, max: 1 }),
  body("tone").optional().trim(),
];

module.exports = { generateTtsRules };
