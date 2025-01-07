const Notification = require("../models/notificationModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResults, sendResult } = require("./handlers/send");

// Get all notifications for the current user
exports.getMyNotifications = catchAsyncMiddle(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort("-createdAt")
    .select("-__v");

  sendResults(res, notifications);
});

// Mark all notifications as read for the current user
exports.markAllAsRead = catchAsyncMiddle(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  sendResult(res, { message: "تم تحديث جميع الإشعارات كمقروءة" });
});

// Mark a specific notification as read
exports.markAsRead = catchAsyncMiddle(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError("لم يتم العثور على الإشعار", 404));
  }

  sendResult(res, notification);
});

// Create a new notification (admin only)
exports.createNotification = catchAsyncMiddle(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  sendResult(res, notification);
});

// Get unread notifications count
exports.getUnreadCount = catchAsyncMiddle(async (req, res, next) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  sendResult(res, { count });
});
