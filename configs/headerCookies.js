const { NODE_ENV } = process.env;

const COOKIE_CONFIG = {
  secure: NODE_ENV !== "development",
  httpOnly: true,
  sameSite: "None", // as the frontend is on another domain;
  path: "/",
};

module.exports = { COOKIE_CONFIG };
