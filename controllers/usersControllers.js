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
  image: ["photo"],
};

// Controller-Level authorization - admin himself && anyone, user only himself;
exports.updateUser = catchAsyncMiddle(async (req, res, next) => {
  const updateSet = updateSets[req.query.updateSet];
  delete req.body.role;

  let user;
  if (req.user.role === "admin" && req.body._id !== req.user._id) {
    user = await User.findById(req.body._id);
  } else if (req.user._id.toString() === req.body._id) {
    user = req.user;
  } else {
    return next(new AppError("غير مصرح لك بتحديث هذا المستخدم", 403));
  }

  if (!user) {
    return next(new AppError("المستخدم غير موجود", 404));
  }

  const filteredBody = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => updateSet.includes(key))
  );

  // MAKE the confirmPassword undefined in case equals password, using save to run hashing;
  if (req.query.updateSet === "accountInfo") {
    if (filteredBody.password !== filteredBody.passwordConfirm) {
      return next(new AppError("كلمة المرور غير متطابقة", 400));
    }
    user.password = filteredBody.password;
    user.save({ validateBeforeSave: true, validateModifiedOnly: true });
    delete filteredBody.password;
    delete filteredBody.passwordConfirm;
  } else if (req.query.updateSet === "image") {
  }

  let newUser;
  newUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { ...filteredBody } },
    { runValidators: true, new: true } // $set will run validation on modified fields;
  );

  console.log("%%%%%%%%%%%%%%%%%%%", newUser);

  sendResult(res, await newUser.getBasicInfo());
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
