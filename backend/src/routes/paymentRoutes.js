const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Webhook body is captured as raw Buffer by app.js middleware before express.json() runs
router.post("/paystack/webhook", paymentController.webhook);

router.use(authenticate);
router.post("/paystack/initialize", paymentController.initialize);
router.post("/paystack/verify", paymentController.verify);
router.get("/balance", paymentController.getBalance);

module.exports = router;
