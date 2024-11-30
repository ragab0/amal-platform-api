const User = require("../models/userModel");
const DeletedUser = require("../models/deletedUserModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Only admin can get all users
exports.getAllUsers = catchAsyncMiddle(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await User.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);
  const users = await User.find()
    .select("-password -passwordConfirm")
    .skip(skip)
    .limit(limit);

  sendResults(res, users, page, totalPages, totalCount);
});

// Update user - admin can update any user, users can only update themselves
exports.updateUser = catchAsyncMiddle(async (req, res, next) => {
  let user;
  // Prevent role modification by non-admins
  if (req.user.role !== "admin" && req.body.role) {
    delete req.body.role;
  }

  if (req.user.role === "admin") {
    user = await User.findById(req.params.userId);
  } else if (req.user._id.toString() === req.params.userId) {
    user = await User.findById(req.user._id);
  } else {
    return next(new AppError("Not authorized to update this user", 403));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update the user
  Object.assign(user, req.body);
  await user.save({ runValidators: true });
  sendResult(res, user.getBasicInfo());
});

// Delete user - admin can delete any user, users can delete themselves
exports.deleteUser = catchAsyncMiddle(async (req, res, next) => {
  let user;
  if (req.user.role === "admin") {
    user = await User.findById(req.params.userId);
  } else if (req.user._id.toString() === req.params.userId) {
    user = await User.findById(req.user._id);
  } else {
    return next(new AppError("Not authorized to delete this user", 403));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Store user data before deletion
  await DeletedUser.create({
    originalId: user._id,
    userData: user.toObject(),
    deletedBy: req.user._id,
    reason: req.body.reason || "No reason provided - Kayf",
  });

  // Delete the user
  await user.deleteOne();
  sendResult(res, null, 204);
});
