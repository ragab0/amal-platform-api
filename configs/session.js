// minimal and only used for OAuth flow:
// the warning ON PRODUCTION is acceptable as sessions are short-lived and only for OAuth

const session = require("express-session");
const { NODE_ENV, JWT_SECRET } = process.env;

const sessionConfig = session({
  secret: JWT_SECRET || "ths-is-our-secret-key-for-session",
  resave: false,
  saveUninitialized: false,
  name: "amal-oauth-session",
  cookie: {
    httpOnly: true,
    maxAge: 300000, // 5 minutes - just enough for OAuth flow
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  },
});

module.exports = sessionConfig;
