const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsyncMiddle");
const { sendResult } = require("./handlers/send");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../configs/s3");

// Protected middle;
exports.uploadProfileImage = catchAsync(async (req, res, next) => {
  if (!req.fileUrl) {
    return next(new AppError("لم يتم رفع أي صورة", 400));
  }

  // Delete previous image if exists
  if (
    req.user.photo &&
    req.user.photo.startsWith(
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
    )
  ) {
    try {
      const oldImageKey = req.user.photo.split("/").pop();
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldImageKey,
        })
      );
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  }

  req.user.photo = req.fileUrl;
  await req.user.save({ validateBeforeSave: false });
  sendResult(res, { photo: req.fileUrl });
});
