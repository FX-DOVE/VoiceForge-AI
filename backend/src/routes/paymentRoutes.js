const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.post("/purchase", paymentController.purchaseCredits);
router.get("/estimate", paymentController.estimateCredits);
router.get("/balance", paymentController.getBalance);

module.exports = router;
