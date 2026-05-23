const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const voiceRoutes = require("./voiceRoutes");
const cloneRoutes = require("./cloneRoutes");
const ttsRoutes = require("./ttsRoutes");
const usageRoutes = require("./usageRoutes");
const adminRoutes = require("./adminRoutes");
const fileRoutes = require("./fileRoutes");
const notificationRoutes = require("./notificationRoutes");
const paymentRoutes = require("./paymentRoutes");
const grokRoutes = require("./grokRoutes");
const { health } = require("../controllers/healthController");

const router = express.Router();

router.get("/health", health);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/voices", voiceRoutes);
router.use("/cloning", cloneRoutes);
router.use("/tts", ttsRoutes);
router.use("/usage", usageRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/grok", grokRoutes);
router.use("/files", fileRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
