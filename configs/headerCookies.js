const { NODE_ENV } = process.env;

const COOKIE_CONFIG = {
  secure: NODE_ENV !== "development",
  httpOnly: true,
  sameSite: "Strict",
  path: "/",
};

module.exports = { COOKIE_CONFIG };
