const express = require("express");
const cloneController = require("../controllers/cloneController");
const { authenticate, requirePlan } = require("../middleware/auth");
const { uploadAudio } = require("../middleware/upload");
const validate = require("../middleware/validate");
const { configureCloneRules, startCloneRules } = require("../validators/cloneValidators");

const multer = require("multer");

const router = express.Router();

function handleUploadMiddleware(req, res, next) {
  uploadAudio.array("samples", 10)(req, res, (err) => {
    if (!err) return next();
    const status = err instanceof multer.MulterError || err.statusCode === 400 ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message || "File upload failed.", errors: {} });
  });
}

router.get("/shared/:token", cloneController.getShared);

router.use(authenticate);
router.use(requirePlan("enterprise"));
router.post("/upload", handleUploadMiddleware, cloneController.upload);
router.post("/configure", configureCloneRules, validate, cloneController.configure);
router.post("/start", startCloneRules, validate, cloneController.start);
router.get("/", cloneController.list);
router.get("/:id/status", cloneController.status);
router.patch("/:id", cloneController.update);
router.delete("/:id", cloneController.deleteClone);

module.exports = router;
