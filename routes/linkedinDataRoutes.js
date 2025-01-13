const express = require('express');
const linkedinDataController = require('../controllers/linkedinDataController');
const { protect } = require('../controllers/authControllers');

const router = express.Router();

// Protected routes - user must be logged in
router.use(protect);

// Route to initiate LinkedIn data fetch
router.get('/fetch', linkedinDataController.initiateLinkedInDataFetch);

// Callback route for LinkedIn
router.get('/callback', linkedinDataController.handleLinkedInDataCallback);

module.exports = router;
