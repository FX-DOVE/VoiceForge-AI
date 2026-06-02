const express = require("express");
const { submitContact } = require("../controllers/contactController");

const router = express.Router();

// Public endpoint — anyone can submit the contact form
router.post("/", submitContact);

module.exports = router;