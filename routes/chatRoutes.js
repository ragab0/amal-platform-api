const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatControllers");
const authControllers = require("../controllers/authControllers");

/** Private routes */
router.use(authControllers.protect);

/** Route-Level auth - admin only */
router.get(
  "/",
  authControllers.assignableTo("admin"),
  ChatController.getAllRooms
);

/** Controller-Level auth - admin only && user owner */
router.get("/:roomId", ChatController.getRoom);

module.exports = router;
