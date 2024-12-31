const { ChatRoom, Message } = require("../models/chatModels");

class ChatController {
  static async getRooms(req, res) {
    try {
      const rooms = await ChatRoom.find({ user: req.user.id });
      res.status(200).json({ success: true, rooms });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve rooms" });
    }
  }

  static async getRoom(req, res) {
    try {
      const room = await ChatRoom.findById(req.params.roomId);
      if (!room)
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      res.status(200).json({ success: true, room });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve room" });
    }
  }

  static async closeRoom(req, res) {
    try {
      const room = await ChatRoom.findByIdAndUpdate(
        req.params.roomId,
        { status: "closed" },
        { new: true }
      );
      if (!room)
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      res.status(200).json({ success: true, room });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to close room" });
    }
  }

  static async getMessages(req, res) {
    try {
      const messages = await Message.find({ room: req.params.roomId }).populate(
        "sender",
        "name"
      );
      res.status(200).json({ success: true, messages });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve messages" });
    }
  }

  static async markAsRead(req, res) {
    try {
      const message = await Message.updateMany(
        { room: req.params.roomId, "readBy.user": { $ne: req.user.id } },
        { $push: { readBy: { user: req.user.id, readAt: new Date() } } }
      );
      res
        .status(200)
        .json({ success: true, message: "Messages marked as read" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to mark messages as read" });
    }
  }
}

module.exports = ChatController;
