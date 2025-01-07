const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: [true, "يجب تحديد الغرفة"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "يجب تحديد المرسل"],
    },
    text: {
      type: String,
      required: [true, "لا يمكن ارسال رسالة فارغة"],
      trim: true,
    },
    attachments: [
      {
        type: String,
        url: String,
        name: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ room: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
