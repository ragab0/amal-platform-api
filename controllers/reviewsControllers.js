const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Utility function to get all reviews with pagination
const getAllReviewsWithPagination = async (req, query = {}) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await Review.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const reviews = await Review.find(
    req.user?.role === "admin" ? undefined : query
  )
    .select(req.user?.role === "admin" ? "+isActive +public" : undefined)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  return { reviews, page, totalPages, totalCount };
};

// controller-Level authorization - admin all, public only (active && public)
exports.getAllReviews = catchAsyncMiddle(async (req, res) => {
  const query =
    req.user?.role === "admin" ? {} : { isActive: true, public: true };
  const { reviews, page, totalPages, totalCount } =
    await getAllReviewsWithPagination(req, query);
  sendResults(res, reviews, page, totalPages, totalCount);
});

// Controller-Level authorization - admin any, user owner;
exports.getReview = catchAsyncMiddle(async (req, res, next) => {
  let query;
  let review;
  if (req.user.role === "admin") {
    query = { _id: req.params.reviewId };
    review = await Review.findOne(query).select("+isActive +public");
  } else {
    query = { user: req.user._id };
    review = await Review.findOne(query);
  }

  if (!review) {
    return next(new AppError("التقييم غير موجود", 404));
  }

  sendResult(res, review);
});

// Controller-Level authorization - Create review (authenticated users)
exports.createReview = catchAsyncMiddle(async (req, res, next) => {
  // Check if user already has a review
  const existingReview = await Review.findOne({ user: req.user._id });
  if (existingReview) {
    return next(new AppError("لديك تقييم موجود بالفعل", 400));
  }

  const review = await Review.create({
    ...req.body,
    user: req.user._id,
  });

  sendResult(res, review);
});

// Controller-Level authorization - Update review (admin or owner)
exports.updateReview = catchAsyncMiddle(async (req, res, next) => {
  const query = { _id: req.params.reviewId };

  // If not admin, user can only update their own review
  if (req.user.role !== "admin") {
    query.user = req.user._id;
  }

  const review = await Review.findOne(query).select("+isActive +public");

  if (!review) {
    return next(new AppError("التقييم غير موجود أو غير مصرح لك بتعديله", 404));
  }

  // Prevent changing the user
  if (req.body.user) {
    delete req.body.user;
  }

  // Only admin can change isActive and public status
  if (req.user.role !== "admin") {
    delete req.body.isActive;
    delete req.body.public;
  }

  Object.assign(review, req.body);
  await review.save({ runValidators: true });

  sendResult(res, review);
});

// Controller-Level authorization - Delete review (admin or owner)
exports.deleteReview = catchAsyncMiddle(async (req, res, next) => {
  const query = { _id: req.params.reviewId };

  // If not admin, user can only delete their own review
  if (req.user.role !== "admin") {
    query.user = req.user._id;
  }

  const review = await Review.findOne(query).select("+isActive");

  if (!review) {
    return next(new AppError("التقييم غير موجود أو غير مصرح لك بحذفه", 404));
  }

  if (req.user.role === "admin") {
    // Admin can permanently delete
    await Review.deleteOne({ _id: req.params.reviewId });
  } else {
    // Users can only soft delete
    review.isActive = false;
    await review.save({ validateBeforeSave: false });
  }

  sendResult(res, null);
});
