const express = require("express");
const professionalController = require("../controllers/professionalController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Public status not useful; everything requires auth
router.use(authenticate);

router.post("/subscribe", professionalController.subscribe);
router.get("/status", professionalController.status);
router.post("/renew", professionalController.renew);

module.exports = router;
