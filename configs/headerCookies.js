const { NODE_ENV } = process.env;

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
  domain: NODE_ENV === "production" ? "amal-dev.vercel.app" : "localhost",
  path: "/",
};

module.exports = { COOKIE_CONFIG };
