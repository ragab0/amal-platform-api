const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Public
exports.getAllReviews = catchAsyncMiddle(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await Review.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);
  const reviews = await Review.find().skip(skip).limit(limit);
  sendResults(res, reviews, page, totalPages, totalCount);
});

// Controller-Level authorization - admin anyone, user only himself;
// Users can create their own reviews
exports.createReview = catchAsyncMiddle(async (req, res) => {
  const newReview = await Review.create({ ...req.body, user: req.user._id });
  sendResult(res, newReview, 201);
});

// Controller-Level authorization - admin anyone, user only himself;
// Users can get their own review, admins can get any review;
exports.getReview = catchAsyncMiddle(async (req, res) => {
  let review;
  if (req.user.role === "admin") {
    review = await Review.findById(req.params.reviewId);
  } else {
    review = await Review.findOne({
      user: req.user._id,
    });
  }
  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  sendResult(res, review);
});

// Controller-Level authorization - admin anyone, user only himself;
exports.updateReview = catchAsyncMiddle(async (req, res, next) => {
  let review;
  if (req.user.role === "admin") {
    review = await Review.findById(req.params.reviewId);
  } else {
    review = await Review.findOne({
      user: req.user._id,
    });
  }
  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  // Prevent changing the user
  if (req.body.user) {
    delete req.body.user;
  }
  // Update the review
  Object.assign(review, req.body);
  await review.save({ runValidators: true });
  sendResult(res, review);
});

// Controller-Level authorization - admin anyone, user only himself;
exports.deleteReview = catchAsyncMiddle(async (req, res) => {
  let review;
  if (req.user.role === "admin") {
    review = await Review.findById(req.params.reviewId);
  } else {
    review = await Review.findOne({
      user: req.user._id,
    });
  }

  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  await review.deleteOne();
  sendResult(res, null, 204);
});
