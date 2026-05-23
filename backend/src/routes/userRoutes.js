const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { updateProfileRules } = require("../validators/userValidators");

const router = express.Router();

router.use(authenticate);
router.get("/profile", userController.getProfile);
router.patch("/profile", updateProfileRules, validate, userController.updateProfile);
router.post("/welcome-modal-seen", userController.markWelcomeModalSeen);

module.exports = router;
