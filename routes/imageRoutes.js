const express = require("express");
const { uploadProfileImage } = require("../controllers/imageController");
const { upload, uploadToS3 } = require("../middlewares/uploadMiddleware");
const authControllers = require("../controllers/authControllers");

const router = express.Router();

router.post(
  "/upload-profile-image",
  authControllers.protect,
  upload.single("image"),
  uploadToS3,
  uploadProfileImage
);

module.exports = router;
