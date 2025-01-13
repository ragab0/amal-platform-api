const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Utility function to get all reviews with pagination
const returnAllReviewsWithPagination = async (req, query = {}) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await Review.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  const reviews = await Review.find(query)
    .select(req.user?.role === "admin" ? "+isPublic +isApproved" : undefined)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");
  return { reviews, page, totalPages, totalCount };
};

// Public Approved;
exports.getAllPublicReviews = catchAsyncMiddle(async (req, res) => {
  const query = { isPublic: true, isApproved: true };
  const { reviews, page, totalPages, totalCount } =
    await returnAllReviewsWithPagination(req, query);
  sendResults(res, reviews, page, totalPages, totalCount);
});

// Route-Level auth - admin only
exports.getAllReviewsAdmin = catchAsyncMiddle(async (req, res) => {
  const { reviews, page, totalPages, totalCount } =
    await returnAllReviewsWithPagination(req);
  sendResults(res, reviews, page, totalPages, totalCount);
});

// Controller-Level auth - owner (admin or user)
exports.getReview = catchAsyncMiddle(async (req, res, next) => {
  let query;
  let review;
  if (req.user.role === "admin") {
    query = { _id: req.params.reviewId };
    review = await Review.findOne(query).select("+isPublic +isApproved");
  } else {
    query = { user: req.user._id };
    review = await Review.findOne(query);
  }
  if (!review) {
    return next(new AppError("التقييم غير موجود", 404));
  }
  sendResult(res, review);
});

// Protected controller - owner only;
exports.createReview = catchAsyncMiddle(async (req, res, next) => {
  delete req.body.isPublic;
  delete req.body.isApproved;

  const hasReview = await Review.findOne({
    user: req.user._id,
  });

  if (hasReview) {
    return next(new AppError("يوجد لديك تقييم موجود بالفعل", 400));
  }

  const review = new Review({ ...req.body, user: req.user._id });
  await review.save({
    validateBeforeSave: true,
  });
  sendResult(res, review.getBasicInfo(), 201);
});

// Controller-Level authorization - Update review (admin or owner)
exports.updateReview = catchAsyncMiddle(async (req, res, next) => {
  let query;
  if (req.user.role !== "admin") {
    req.body.isPublic = false; // reset;
    req.body.isApproved = false; // reset;
    req.body.user = req.user._id; // make sure, it's his own;
    query = { _id: req.params.reviewId, user: req.user._id };
  } else {
    query = { _id: req.params.reviewId };
  }

  const review = await Review.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError("التقييم غير موجود", 404));
  }

  sendResult(res, review.getBasicInfo());
});

// Protected controller - owner only
exports.deleteReview = catchAsyncMiddle(async (req, res, next) => {
  const review = await Review.findOneAndDelete({ user: req.user._id });
  if (!review) {
    return next(new AppError("التقييم غير موجود", 404));
  }
  sendResult(res);
});
