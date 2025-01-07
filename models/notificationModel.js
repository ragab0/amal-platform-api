const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "يجب تحديد المستلم للإشعار"],
    },
    type: {
      type: String,
      enum: {
        values: ["message", "event", "account", "system"],
        message: "نوع الإشعار غير صالح",
      },
      required: [true, "يجب تحديد نوع الإشعار"],
    },
    title: {
      type: String,
      required: [true, "يجب تحديد عنوان الإشعار"],
      trim: true,
      maxLength: [100, "عنوان الإشعار يجب أن لا يتجاوز 100 حرف"],
    },
    text: {
      type: String,
      required: [true, "يجب تحديد محتوى الإشعار"],
      trim: true,
      maxLength: [500, "محتوى الإشعار يجب أن لا يتجاوز 500 حرف"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
