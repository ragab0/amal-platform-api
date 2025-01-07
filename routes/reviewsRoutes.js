const reviewsControllers = require("../controllers/reviewsControllers");
const reviewsRouter = require("express").Router();
const authControllers = require("../controllers/authControllers");

/* Public routes */
reviewsRouter.get("/public", reviewsControllers.getAllPublicReviews);

/* Protected routes */
reviewsRouter.use(authControllers.protect);

// Route-Level auth - admin only
reviewsRouter
  .route("/")
  .get(
    authControllers.assignableTo("admin"),
    reviewsControllers.getAllReviewsAdmin
  )
  .post(reviewsControllers.createReview);
reviewsRouter
  .route("/:reviewId")
  .get(reviewsControllers.getReview)
  .put(reviewsControllers.updateReview)
  .delete(reviewsControllers.deleteReview);

module.exports = reviewsRouter;
