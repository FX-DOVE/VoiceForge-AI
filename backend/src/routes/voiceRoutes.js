const express = require("express");
const voiceController = require("../controllers/voiceController");
const { authenticate, optionalAuthenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalAuthenticate, voiceController.list);
router.get("/provider/:provider", optionalAuthenticate, voiceController.listByProvider);
router.get("/model/:model", optionalAuthenticate, voiceController.listByModel);
router.get("/:slug/preview", voiceController.preview);
router.get("/:slug", voiceController.getBySlug);
router.post("/", authenticate, voiceController.create);

module.exports = router;
