const ChatRoom = require("../models/chatModel");
const Message = require("../models/messageModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResults, sendResult } = require("./handlers/send");

/** Route-Level auth */
const getAllRooms = catchAsyncMiddle(async (req, res, next) => {
  const rooms = await ChatRoom.find({ isActive: true });
  sendResults(res, rooms);
});

/** Controller-Level auth */
const getRoom = catchAsyncMiddle(async (req, res, next) => {
  let room;
  if (req.user.role === "admin") {
    room = await ChatRoom.findById(req.params.roomId);
    if (!room) return next(new AppError("لم يتم العثور على الغرفة", 404));
  } else {
    room = await ChatRoom.findOne({ user: req.user._id.toString() });
    if (!room) {
      try {
        room = await ChatRoom.create({ user: req.user._id.toString() });
      } catch (error) {
        logger.error(error);
      }
    }
  }

  const roomObj = room.toObject();
  roomObj.messages = await Message.find({ room: room._id.toString() });

  sendResult(res, roomObj);
});

module.exports = {
  getAllRooms,
  getRoom,
};
