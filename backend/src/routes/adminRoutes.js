const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, requireRole("admin"));
router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.users);
router.patch("/users/:id", adminController.updateUser);
router.get("/system-health", adminController.systemHealth);
router.get("/billing", adminController.billing);
router.get("/settings", adminController.settings);

module.exports = router;
