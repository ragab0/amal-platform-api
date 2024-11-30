const CV = require("../models/cvModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Only admin can get all CVs
exports.getAllCVs = catchAsyncMiddle(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await CV.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);
  const cvs = await CV.find().select("+isActive").skip(skip).limit(limit);
  sendResults(res, cvs, page, totalPages, totalCount);
});

// Users can only get their own CV (based on coming ID), admins can get any CV
exports.getCV = catchAsyncMiddle(async (req, res, next) => {
  let cv;
  if (req.user.role === "admin") {
    cv = await CV.findById(req.params.cvId).select("+isActive");
  } else {
    cv = await CV.findOne({ user: req.user._id });
  }
  if (!cv) {
    return next(new AppError("CV not found", 404));
  }
  sendResult(res, cv);
});

// Users can only update their own CV, admins can update any CV
exports.updateCV = catchAsyncMiddle(async (req, res, next) => {
  let cv;
  if (req.user.role === "admin") {
    cv = await CV.findById(req.params.cvId).select("+isActive");
  } else {
    cv = await CV.findOne({ user: req.user._id });
    // Prevent changing isActive through update BY THE USER
    if (req.body.isActive !== undefined) {
      delete req.body.isActive;
    }
  }

  if (!cv) {
    return next(new AppError("CV not found", 404));
  }

  // Update the CV
  Object.assign(cv, req.body);
  await cv.save({ runValidators: true });
  sendResult(res, cv);
});

// Soft delete - only admin can de/activate CVs
exports.unActiveCV = catchAsyncMiddle(async (req, res, next) => {
  const cv = await CV.findById(req.params.cvId).select("+isActive");
  if (!cv) {
    return next(new AppError("CV not found", 404));
  }
  cv.isActive = false;
  await cv.save({ validateBeforeSave: false });
  sendResult(res, null, 204);
});
