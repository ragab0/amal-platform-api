const authControllers = require("../controllers/authControllers");
const oauthControllers = require("../controllers/oauthControllers");
const passport = require("passport");
const authRouter = require("express").Router();
const { authLimiter } = require("../configs/limiter");

/* public routes - may with limiter (4) */
authRouter.post("/signup", authLimiter, authControllers.signup);
authRouter.post("/login", authLimiter, authControllers.login);
authRouter.post("/logout", authControllers.logout);
authRouter.post(
  "/generate-verification",
  authControllers.generateVerificationCode
);
authRouter.post("/verify-email", authLimiter, authControllers.verifyEmail);
authRouter.post(
  "/forget-password",
  authLimiter,
  authControllers.forgotPassword
);
authRouter.post("/reset-password", authControllers.resetPassword);
authRouter.post("/verify-reset-token", authControllers.verifyResetToken);

/* OAuth routes */
// 01 Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
authRouter.get(
  "/google/callback",
  oauthControllers.handleGoogleCallback,
  authControllers.providerCallback
);

// 02 LinkedIn OAuth
authRouter.get("/linkedin", passport.authenticate("linkedin"));
authRouter.get(
  "/linkedin/callback",
  oauthControllers.handleLinkedInCallback,
  authControllers.providerCallback
);

/* protected routes */
authRouter.get("/is-login", authControllers.protect, authControllers.isLogin);
// authRouter.post(
//   "/reset-password",
//   authControllers.protect,
//   authControllers.resetPassword
// );

module.exports = authRouter;
