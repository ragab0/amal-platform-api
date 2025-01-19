const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../configs/s3");
const crypto = require("crypto");
const AppError = require("../utils/appError");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("MULTER FILE:", file);
    console.log("MULTER FILE MIME TYPE:", file.mimetype);
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new AppError("يجب رفع صورة فقط", 400), false);
    }
  },
});

// Middleware to upload to S3
const uploadToS3 = async (req, res, next) => {
  const file = req.body.photo;
  if (!file || !file.startsWith("data:image")) {
    return next(new AppError("يرجي إرفاق صورة", 400));
  }

  const fileExtension = file.split(";")[0].split("/")[1];
  const fileMimeType = file.split(";")[0].split("/")[0];
  const fileBuffer = Buffer.from(file.split(",")[1], "base64");
  const randomName = crypto.randomBytes(16).toString("hex");
  const key = `${randomName}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: `${fileMimeType}/${fileExtension}`,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    req.fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    next();
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return next(
      new AppError("عذراً, حدث خطاء في رفع الصورة, يرجي المحاولة مرة اخرى", 400)
    );
  }
};

module.exports = { upload, uploadToS3 };
