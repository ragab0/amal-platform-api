const { NODE_ENV } = process.env;

const COOKIE_CONFIG = {
  secure: NODE_ENV !== "development",
  httpOnly: true,
  sameSite: "Strict",
  path: "/",
  domain: NODE_ENV === "production" ? process.env.DOMAIN : undefined,
};

module.exports = { COOKIE_CONFIG };
