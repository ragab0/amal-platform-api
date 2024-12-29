const express = require("express");
const { protect } = require("../controllers/authControllers");
const { generateContent } = require("../controllers/aiContentControllers");

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate AI content
router.post("/generate", generateContent);

module.exports = router;
