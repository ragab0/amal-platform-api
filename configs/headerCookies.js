const { NODE_ENV, FRONTEND_URL } = process.env;

// const COOKIE_CONFIG = {
//   httpOnly: true,
//   secure: NODE_ENV === "production",
//   sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
//   path: "/",
// };

const COOKIE_CONFIG = {
  httpOnly: false,
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
};

module.exports = { COOKIE_CONFIG };
