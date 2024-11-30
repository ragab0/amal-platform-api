const authControllers = require("../controllers/authControllers");
const cvsControllers = require("../controllers/cvsControllers");
const cvsRouter = require("express").Router();

// Protected routes - require authentication
cvsRouter.use(authControllers.protect);

cvsRouter
  .route("/")
  .get(authControllers.assignableTo("admin"), cvsControllers.getAllCVs);
cvsRouter
  .route("/:tempId")
  .get(cvsControllers.getCV)
  .put(cvsControllers.updateCV)
  .delete(authControllers.assignableTo("admin"), cvsControllers.unActiveCV);

module.exports = cvsRouter;
