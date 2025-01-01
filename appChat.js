const {
  handleJoinRoom,
  handleMessage,
  handleTyping,
  handleRead,
  handleDisconnect,
} = require("./services/chat/appChatHandlers");

// Socket.IO event handlers
module.exports = matchMediayIoEventHandlers = function (myIo) {
  return myIo.on("connection", (socket) => {
    console.log("Welcome");
    socket.on("join_room", handleJoinRoom);
    socket.on("leave_room", handleRemoveRoom);
    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("disconnect", handleDisconnect);
  });
};
