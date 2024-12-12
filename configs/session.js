const session = require("express-session");
const { NODE_ENV } = process.env;

const sessionConfig = session({
  secret: process.env.JWT_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === "production",
    maxAge: 60000, // 1 minute - just for OAuth flow
  },
});

module.exports = sessionConfig;
