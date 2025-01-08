const { NODE_ENV } = process.env;

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
  path: "/",
  domain: "job.sa",
  partitioned: NODE_ENV === "production", // for io;
};

module.exports = { COOKIE_CONFIG };
