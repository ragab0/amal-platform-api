// const c = require("../controllers/a");
const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(c.getAllReviews).post(c.createReview);
reviewsRouter
  .route("/:tempId")
  .get(c.getReviewById)
  .put(c.updateReview)
  .delete(c.deleteReview);

module.exports = reviewsRouter;
