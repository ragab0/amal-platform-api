const usersControllers = require("../controllers/usersControllers");
const usersRouter = require("express").Router();
const authControllers = require("../controllers/authControllers");

/* Protected routes */
usersRouter.use(authControllers.protect);

/* shared routes - a user can handle only itself && admin can handle anyone */
usersRouter
  .route("/:userId")
  .put(usersControllers.updateUser)
  .delete(usersControllers.deleteUser);

/* Only admin routes; */
usersRouter
  .route("/")
  .get(authControllers.assignableTo("admin"), usersControllers.getAllUsers);

module.exports = usersRouter;
