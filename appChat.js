const {
  handleJoinRoom,
  handleMessage,
  handleTyping,
  handleRead,
  handleDisconnect,
} = require("./services/chat/appChatHandlers");

// Socket.IO event handlers
module.exports = matchMediayIoEventHandlers = function (myIo) {
  myIo.on("connection", (socket) => {
    console.log("Welcome");

    socket.on("join_room", handleJoinRoom);
    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("read", handleRead);
    socket.on("disconnect", handleDisconnect);
  });
};
