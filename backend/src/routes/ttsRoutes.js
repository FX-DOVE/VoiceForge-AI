const express = require("express");
const ttsController = require("../controllers/ttsController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { generateTtsRules } = require("../validators/ttsValidators");

const router = express.Router();

router.use(authenticate);
router.post("/generate", generateTtsRules, validate, ttsController.generate);
router.get("/history", ttsController.history);
router.get("/:id", ttsController.getById);
router.delete("/:id", ttsController.deleteById);

module.exports = router;
