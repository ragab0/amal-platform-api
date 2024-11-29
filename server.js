require("dotenv").config({ path: "./.env" });
const http = require("http");
const connectDatabase = require("./configs/database");
const app = require("./app");

const { PORT = 3500 } = process.env;

// connect to the db
connectDatabase();

// setting up a main server with our first nested server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("Server is running and listening on:", PORT);
});
