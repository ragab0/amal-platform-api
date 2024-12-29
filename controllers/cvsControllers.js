const CV = require("../models/cvModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Route-Level authorization;
exports.getAllCVs = catchAsyncMiddle(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await CV.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);
  const cvs = await CV.find().select("+isActive").skip(skip).limit(limit);
  sendResults(res, cvs, page, totalPages, totalCount);
});

// Controller-Level authorization - admin anyone, user only himself;
exports.getCV = catchAsyncMiddle(async (req, res, next) => {
  let cv;
  if (req.user.role === "admin") {
    cv = await CV.findOne(
      req.params.cvId?.length === 24
        ? { _id: req.params.cvId }
        : { user: req.user._id }
    ).select("+isActive");
  } else {
    cv = await CV.findOne({ user: req.user._id });
  }
  if (!cv) {
    return next(new AppError("السيرة الذاتية غير موجودة", 404));
  }
  sendResult(res, cv);
});

// Controller-Level authorization - admin anyone, user only himself;
exports.updateCV = catchAsyncMiddle(async (req, res, next) => {
  let cv;
  if (req.user.role === "admin") {
    cv = await CV.findOneAndUpdate(
      req.params.cvId?.length === 24
        ? { _id: req.params.cvId }
        : { user: req.user._id },
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
  } else {
    if (req.body.isActive !== undefined) {
      delete req.body.isActive; // Prevent changing isActive through update BY THE USER
    }
    cv = await CV.findOneAndUpdate({ user: req.user._id }, req.body, {
      runValidators: true,
      new: true,
    });
  }

  if (!cv) {
    return next(new AppError("السيرة الذاتية غير موجودة", 404));
  }

  sendResult(res, cv);
});

// Route-Level authroization && Soft delete;
exports.unActiveCV = catchAsyncMiddle(async (req, res, next) => {
  const cv = await CV.findById(req.params.cvId).select("+isActive");
  if (!cv) {
    return next(new AppError("السيرة الذاتية غير موجودة", 404));
  }
  cv.isActive = false;
  await cv.save({ validateBeforeSave: false });
  sendResult(res, null, 204);
});
