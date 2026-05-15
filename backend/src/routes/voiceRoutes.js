const express = require("express");
const voiceController = require("../controllers/voiceController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", voiceController.list);
router.get("/:slug/preview", voiceController.preview);
router.get("/:slug", voiceController.getBySlug);
router.post("/", authenticate, voiceController.create);

module.exports = router;
