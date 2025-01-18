const passport = require("passport");
const { FRONTEND_URL } = process.env;

exports.handleGoogleCallback = (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err) {
      return res.redirect(
        `${FRONTEND_URL}/auth/callback?auth=error&provider=google&error=${encodeURIComponent(
          err.message
        )}`
      );
    }
    if (!user) {
      return res.redirect(
        `${FRONTEND_URL}/auth/callback?auth=error&provider=google&error=user_cancelled`
      );
    }
    req.user = user;
    next();
  })(req, res, next);
};

exports.handleLinkedInCallback = (req, res, next) => {
  passport.authenticate("linkedin", (err, user) => {
    if (err) {
      return res.redirect(
        `${FRONTEND_URL}/auth/callback?auth=error&provider=linkedin&error=${encodeURIComponent(
          err.message
        )}`
      );
    }
    if (!user) {
      return res.redirect(
        `${FRONTEND_URL}/auth/callback?auth=error&provider=linkedin&error=user_cancelled`
      );
    }
    req.user = user;
    next();
  })(req, res, next);
};
