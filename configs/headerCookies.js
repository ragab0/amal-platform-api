const { NODE_ENV } = process.env;

// FOR DEV -> TILL WE GOT ON A DOMAIN WITH SUBDOMAIN TO NOT FAIL ON THIRD-PARTY
// WHICH NOT WORK WITH ME ON PRODUCTION !!;
const COOKIE_CONFIG = {
  // httpOnly: true,
  // secure: NODE_ENV === "production",
  // sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
  // domain: NODE_ENV === "development" ? "localhost" : ".vercel.app",
  // path: "/",
};

module.exports = { COOKIE_CONFIG };
