const reviewsRouter = require("express").Router();
const reviewsControllers = require("../controllers/reviewsControllers");
const { protect } = require("../controllers/authControllers");

// Public routes
reviewsRouter.route("/").get(reviewsControllers.getAllReviews);
reviewsRouter.route("/:reviewId").get(reviewsControllers.getReview);

// Protected routes - require authentication
reviewsRouter.use(protect);
reviewsRouter.route("/").post(reviewsControllers.createReview);
reviewsRouter
  .route("/:reviewId")
  .put(reviewsControllers.updateReview)
  .delete(reviewsControllers.deleteReview);

module.exports = reviewsRouter;
