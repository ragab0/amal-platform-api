// const c = require("../controllers/a");
const usersRouter = require("express").Router();

usersRouter.route("/").get(c.getAllReviews).post(c.createReview);
usersRouter
  .route("/:userId")
  .get(c.getReview)
  .put(c.updateReview)
  .delete(c.deleteReview);

module.exports = usersRouter;
