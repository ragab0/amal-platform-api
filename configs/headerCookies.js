const { NODE_ENV, FRONTEND_URL } = process.env;

console.log(FRONTEND_URL);

const COOKIE_CONFIG = {
  secure: NODE_ENV !== "development", // Must be true in production for SameSite=None
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "None" : "Lax", // None for cross-site, must be used with secure=true
  path: "/",
};

module.exports = { COOKIE_CONFIG };
