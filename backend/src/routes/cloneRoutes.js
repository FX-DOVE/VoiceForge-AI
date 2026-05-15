const express = require("express");
const cloneController = require("../controllers/cloneController");
const { authenticate } = require("../middleware/auth");
const { uploadAudio } = require("../middleware/upload");
const validate = require("../middleware/validate");
const { configureCloneRules, startCloneRules } = require("../validators/cloneValidators");

const router = express.Router();

router.use(authenticate);
router.post("/upload", uploadAudio.array("samples", 10), cloneController.upload);
router.post("/configure", configureCloneRules, validate, cloneController.configure);
router.post("/start", startCloneRules, validate, cloneController.start);
router.get("/:id/status", cloneController.status);

module.exports = router;
