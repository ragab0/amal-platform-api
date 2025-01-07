const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationControllers");
const authControllers = require("../controllers/authControllers");

/** Private routes */
router.use(authControllers.protect);

// User routes
router.get("/", NotificationController.getMyNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.patch("/mark-all-read", NotificationController.markAllAsRead);
router.patch("/:id/mark-read", NotificationController.markAsRead);

// Admin routes
router.post(
  "/",
  authControllers.assignableTo("admin"),
  NotificationController.createNotification
);

module.exports = router;
