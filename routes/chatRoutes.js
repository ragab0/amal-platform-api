const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");

// Chat Routes
router.get("/rooms", ChatController.getRooms);
router.get("/rooms/:roomId", ChatController.getRoom);
router.post("/rooms/:roomId/close", ChatController.closeRoom);
router.get("/rooms/:roomId/messages", ChatController.getMessages);
router.post("/rooms/:roomId/read", ChatController.markAsRead);

module.exports = router;
