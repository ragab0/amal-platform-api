require("dotenv").config({ path: "./.env" });
const http = require("http");
const connectDatabase = require("./configs/database");
const app = require("./app");

console.log(
  "ENV VARS ARE:",
  process.env.FRONTEND_URL,
  process.env.GOOGLE_CALLBACK_URL,
  process.env.LINKEDIN_CALLBACK_URL
);

const { PORT = 3500 } = process.env;

// connect to the db
connectDatabase();

// setting up a main server with our first nested server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("Server is running and listening on:", PORT);
});
