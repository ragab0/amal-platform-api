const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const ChatRoom = require("../models/chatModel");

async function protectSocket(socket, next) {
  try {
    // Parse cookies from the handshake headers
    const cookies = socket.handshake.headers.cookie
      ? cookie.parse(socket.handshake.headers.cookie)
      : {};
    const token = cookies["jwt"];
    if (!token) return next(new AppError("يرجى تسجيل الدخول أولاً", 401));
    // Verify the JWT || JsonWebTokenError .. Attach { id, role, iat, exp }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find or create a room and re-use it while the entire session;
    let room = await ChatRoom.findOne({ user: decoded.id }).select(
      "+isActive +adminsUnreadCount"
    );
    if (!room) {
      room = await ChatRoom.create({ user: decoded.id });
    }

    socket.currentUserDecode = decoded;
    socket.currentUserRoom = room; // might be null if no room exists yet
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    return next(new AppError("حدث خطأ في التحقق, يرجي تسجيل الدخول", 440));
  }
}

async function checkRoomAccess(socket, roomId) {
  // If user is admin, they can access any room
  if (socket.currentUserDecode.role === "admin") {
    const targetRoom = await ChatRoom.findById(roomId);
    if (!targetRoom) {
      throw new AppError("غرفة المحادثة غير موجودة", 404);
    }
    return targetRoom;
  }

  // For normal users, they can only access their assigned room
  if (roomId !== socket.currentUserRoom._id.toString()) {
    throw new AppError("غير مصرح لك بالوصول إلى هذه الغرفة", 403);
  }
  return socket.currentUserRoom;
}

module.exports = {
  protectSocket,
  checkRoomAccess,
};
