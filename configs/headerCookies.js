const { NODE_ENV, FRONTEND_URL } = process.env;

let frontEndDomain = new URL(FRONTEND_URL).hostname;
frontEndDomain = frontEndDomain.startsWith("www.")
  ? frontEndDomain.slice(3)
  : frontEndDomain;
console.log("FRONT_END IS:", FRONTEND_URL, "HEADER DOMAIN IS:", frontEndDomain);

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin (different domains) requests
  path: "/",
  domain: frontEndDomain,
  partitioned: NODE_ENV === "production", // for io;
};

module.exports = { COOKIE_CONFIG };
