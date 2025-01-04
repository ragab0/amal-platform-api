const { rateLimit } = require("express-rate-limit");

// Global API rate limiter
module.exports.apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  limit: 60, // Limit each IP to 60 requests per windowMs
  message: "طلبات كثيرة. يرجى المحاولة لاحقًا خلال دقيقة",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for auth routes
module.exports.authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  limit: 10, // Limit each IP to 10 requests per windowMs
  message: "طلبات كثيرة. يرجى المحاولة لاحقًا خلال دقيقة",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Don't skip even if request was successful
  skipFailedRequests: false, // Don't skip failed requests
});
