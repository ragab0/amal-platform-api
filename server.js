require("dotenv").config({ path: "./.env" });
const { Server: SocketIoServer } = require("socket.io");
const http = require("http");
const connectDatabase = require("./configs/database");
const app = require("./app");
const myIoEventHandlers = require("./appChat");

const { PORT = 3500 } = process.env;

// 0. connect to the db
connectDatabase();

// 0. setting up a main server with our first nested server (the app REQUIRED)
// 0. setting up a main server with our second nested server (the chat app CREATED HERE);
const server = http.createServer(app);
const myIo = new SocketIoServer(server);

// 0. setting up our Socket.IO event handlers
myIoEventHandlers(myIo);

// 1. run the server;
server.listen(PORT, () => {
  console.log("Server is running and listening on:", PORT);
});

module.exports = { myIo };
