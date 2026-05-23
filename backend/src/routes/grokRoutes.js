const express = require("express");
const router = express.Router();
const grokController = require("../controllers/grokController");
const { authenticate, requireRole } = require("../middleware/auth");

// All routes require admin access
router.use(authenticate, requireRole("admin"));

// Dashboard
router.get("/dashboard", grokController.getDashboardStats);

// Funding
router.get("/funding", grokController.listFundings);
router.post("/funding", grokController.addFunding);
router.patch("/funding/:id", grokController.updateFunding);
router.delete("/funding/:id", grokController.deleteFunding);

// Usage
router.get("/usage", grokController.listUsage);
router.post("/usage", grokController.recordUsage);

// API Keys
router.get("/api-keys", grokController.listApiKeys);
router.post("/api-keys", grokController.createApiKey);
router.patch("/api-keys/:id", grokController.updateApiKey);
router.post("/api-keys/:id/revoke", grokController.revokeApiKey);
router.delete("/api-keys/:id", grokController.deleteApiKey);

// Alerts
router.get("/alerts", grokController.listAlerts);
router.post("/alerts/:id/acknowledge", grokController.acknowledgeAlert);
router.post("/alerts/:id/resolve", grokController.resolveAlert);

// Settings
router.get("/settings", grokController.getSettings);
router.patch("/settings", grokController.updateSettings);

// Analytics
router.get("/analytics", grokController.getAnalytics);

// Balance check
router.get("/check-balance", grokController.checkBalance);

// Sync with xAI Billing
router.post("/sync-xai", grokController.syncXaiBilling);

module.exports = router;
