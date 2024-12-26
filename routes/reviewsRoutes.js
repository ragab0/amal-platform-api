const reviewsControllers = require("../controllers/reviewsControllers");
const reviewsRouter = require("express").Router();
const authControllers = require("../controllers/authControllers");

/* Public routes */
reviewsRouter.get("/public", reviewsControllers.getAllReviews);

/* Protected routes && Controller-Level authorization - User can CRUD their own reviews */
reviewsRouter.use(authControllers.protect);

reviewsRouter
  .route("/")
  .get(
    // Route-Level
    authControllers.assignableTo("admin")
    // reviewsControllers.getAllReviewsAdmin
  )
  .post(reviewsControllers.createReview);
reviewsRouter
  .route("/:reviewId")
  .get(reviewsControllers.getReview)
  .put(reviewsControllers.updateReview)
  .delete(reviewsControllers.deleteReview);

module.exports = reviewsRouter;
