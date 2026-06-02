const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, requireRole("admin"));
router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.users);
router.patch("/users/:id", adminController.updateUser);
router.post("/users/:id/ban", adminController.banUser);
router.post("/users/:id/unban", adminController.unbanUser);
router.post("/users/:id/restrict", adminController.restrictUser);
router.post("/users/:id/unrestrict", adminController.unrestrictUser);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:id/add-credits", adminController.addCredits);
router.get("/system-health", adminController.systemHealth);
router.get("/billing", adminController.billing);
router.get("/settings", adminController.settings);
router.get("/billing-settings", adminController.getBillingSettings);
router.put("/billing-settings", adminController.updateBillingSettings);
router.get("/billing-profiles", adminController.listBillingProfiles);
router.put("/billing-profiles", adminController.updateBillingProfile);
router.get("/tts-analytics", adminController.ttsAnalytics);
router.post("/test-email", adminController.testEmail);
router.get("/email-templates", adminController.previewEmailTemplates);
router.get("/email-templates/:id/preview", adminController.previewEmailTemplate);
router.post("/reset-all-credits", adminController.resetAllCredits);
router.post("/gift-email/send", adminController.sendGiftEmail);
router.get("/gift-email/campaigns", adminController.getGiftCampaigns);

module.exports = router;
