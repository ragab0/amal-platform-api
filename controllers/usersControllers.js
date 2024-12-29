const User = require("../models/userModel");
const DeletedUser = require("../models/deletedUserModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Route-Level auhtorization;
exports.getAllUsers = catchAsyncMiddle(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await User.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);
  const users = await User.find()
    .select("-password -passwordConfirm +isActive")
    .skip(skip)
    .limit(limit);

  sendResults(res, users, page, totalPages, totalCount);
});

const updateSets = {
  basicInfo: ["fname", "lname", "headline", "phone", "country", "photo"],
  accountInfo: ["email", "password", "passwordConfirm"],
};

// Controller-Level authorization - admin anyone, user only himself;
exports.updateUser = catchAsyncMiddle(async (req, res, next) => {
  const updateSet = updateSets[req.query.updateSet];
  let user;
  if (req.user.role !== "admin" && req.body.role) {
    delete req.body.role;
  }

  if (req.user.role === "admin") {
    user = await User.findById(req.body._id);
  } else if (req.user._id.toString() === req.body._id) {
    user = req.user;
  } else {
    return next(new AppError("غير مصرح لك بتحديث هذا المستخدم", 403));
  }

  if (!user) {
    return next(new AppError("المستخدم غير موجود", 404));
  }

  let newUser;
  const filteredBody = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => updateSet.includes(key))
  );

  // Handle password update separately
  if (
    req.query.updateSet === "accountInfo" &&
    (filteredBody.password || filteredBody.passwordConfirm)
  ) {
    if (filteredBody.password !== filteredBody.passwordConfirm) {
      return next(new AppError("كلمة المرور غير متطابقة", 400));
    }
    if (filteredBody.email) {
      user.email = filteredBody.email;
    }
    user.setNewPassword(filteredBody.password);
    await user.save({ validateBeforeSave: true });
    newUser = user;
  } else {
    // For non-password updates
    newUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { ...filteredBody } },
      { runValidators: true, new: true }
    );
  }

  sendResult(res, newUser.getBasicInfo());
});

// Controller-Level authorization - admin anyone, user only himself;
exports.deleteUser = catchAsyncMiddle(async (req, res, next) => {
  let user;
  if (req.user.role === "admin") {
    user = await User.findById(req.params.userId);
  } else if (req.user._id.toString() === req.params.userId) {
    user = req.user;
  } else {
    return next(new AppError("غير مصرح لك بحذف هذا المستخدم", 403));
  }

  if (!user) {
    return next(new AppError("المستخدم غير موجود", 404));
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
