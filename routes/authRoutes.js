const authControllers = require("../controllers/authControllers");
const passport = require("passport");
const authRouter = require("express").Router();
const { authLimiter } = require("../configs/limiter");
const { FRONTEND_URL } = process.env;

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
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/auth/callback?auth=error&provider=google`,
  }),
  authControllers.providerCallback
);

// 02 LinkedIn OAuth
authRouter.get("/linkedin", passport.authenticate("linkedin"));
authRouter.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${FRONTEND_URL}/auth/callback?auth=error&provider=linkedin`,
  }),
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
