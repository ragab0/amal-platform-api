// Rate limiter for:
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, please try again after 30 seconds",
});

const signupLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: "Too many accounts created. Please try again after 5 minutes",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset requests. Please try again after 10 minutes",
});

const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset attempts. Please try again after 10 minutes",
});

module.exports = {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};
