const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure one room per user
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
      select: false,
    },
    adminsUnreadCount: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure fast lookups by user
chatRoomSchema.index({ user: 1 }, { unique: true });

/* Pre-hook for automatic population */
chatRoomSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: "lastMessage",
    },
    {
      path: "user",
      select: "fname lname photo role email",
    },
  ]);
  next();
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
