const { NODE_ENV, FRONTEND_URL } = process.env;

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
  domain:
    NODE_ENV === "production"
      ? `.${new URL(FRONTEND_URL).hostname}`
      : "localhost",
  path: "/",
};

module.exports = { COOKIE_CONFIG };
