/* Socket.IO event handlers */

function handleJoinRoom(data) {
  console.log("handleJoinRoom", data);
}

function handleMessage(data) {}

function handleTyping(data) {}

function handleRead(data) {}

function handleDisconnect(data) {}

module.exports = {
  handleJoinRoom,
  handleMessage,
  handleTyping,
  handleRead,
  handleDisconnect,
};
