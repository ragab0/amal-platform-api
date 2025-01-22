const { PutObjectCommand } = require("@aws-sdk/client-s3");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const multer = require("multer");
const s3Client = require("../configs/s3");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new AppError("يجب رفع صورة فقط", 400), false);
    }
  },
});

// Middleware to upload to S3
const uploadToS3 = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("يرجي إرفاق صورة", 400));
  }

  // Get file extension from mimetype
  const extension = req.file.mimetype.split("/")[1];
  const filename = `${crypto.randomBytes(16).toString("hex")}.${extension}`;

  try {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Set the S3 URL
    req.fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    next();
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return next(new AppError("حدث خطأ أثناء رفع الصورة", 400));
  }
};

module.exports = { upload, uploadToS3 };
