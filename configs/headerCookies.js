const { NODE_ENV } = process.env;

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
  domain: NODE_ENV === "development" ? "localhost" : ".amal-dev.vercel.app",
  path: "/",
};

module.exports = { COOKIE_CONFIG };
