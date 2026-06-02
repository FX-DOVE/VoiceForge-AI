const express = require("express");
const elevenlabsController = require("../controllers/elevenlabsController");
const { authenticate, requireProfessional } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.use(requireProfessional());

router.post("/generate", elevenlabsController.generate);

module.exports = router;
