const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", forgotPasswordRules, validate, authController.forgotPassword);
router.post("/reset-password", resetPasswordRules, validate, authController.resetPassword);
router.get("/me", authenticate, authController.me);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", forgotPasswordRules, validate, authController.resendVerification);

module.exports = router;
