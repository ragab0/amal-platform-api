const usersControllers = require("../controllers/usersControllers");
const usersRouter = require("express").Router();
const authControllers = require("../controllers/authControllers");

// Protected routes - require authentication
usersRouter.use(authControllers.protect);

usersRouter
  .route("/")
  .get(authControllers.assignableTo("admin"), usersControllers.getAllUsers);

usersRouter
  .route("/:userId")
  .put(usersControllers.updateUser)
  .delete(usersControllers.deleteUser);

module.exports = usersRouter;
