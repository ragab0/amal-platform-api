const authControllers = require("../controllers/authControllers");
const authRouter = require("express").Router();

authRouter.route("/signup").post(authControllers.signup);
authRouter.route("/login").post(authControllers.login);
authRouter
  .route("/is-login")
  .get(authControllers.protect, authControllers.isLogin);
authRouter.route("/logout").post(authControllers.logout);

module.exports = authRouter;
