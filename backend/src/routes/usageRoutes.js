const express = require("express");
const usageController = require("../controllers/usageController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.get("/summary", usageController.summary);

module.exports = router;
