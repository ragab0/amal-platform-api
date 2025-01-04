const { rateLimit } = require("express-rate-limit");

module.exports.apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  limit: 60, // Limit each IP to 60 requests per windowMs
  message: "طلبات كثيرة. يرجى المحاولة لاحقًا خلال دقيقة",
});

module.exports.authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  limit: 10, // Limit each IP to 10 requests per windowMs
  message: "طلبات كثيرة. يرجى المحاولة لاحقًا خلال دقيقة",
});
