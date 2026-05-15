const express = require("express");
const fileController = require("../controllers/fileController");
const { authenticate } = require("../middleware/auth");
const { uploadGeneral } = require("../middleware/upload");

const router = express.Router();

router.post("/upload", authenticate, uploadGeneral.single("file"), fileController.upload);

module.exports = router;
