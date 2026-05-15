const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, requireRole("admin"));
router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.users);
router.get("/system-health", adminController.systemHealth);

module.exports = router;
