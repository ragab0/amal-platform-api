const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "يجب تحديد المستخدم"],
      unique: [true, "لا يمكن إضافة أكثر من تقييم لنفس المستخدم"],
    },
    rating: {
      type: Number,
      required: [true, "يجب تحديد التقييم"],
      min: [1, "التقييم يجب أن يكون بين 1 و 5"],
      max: [5, "التقييم يجب أن يكون بين 1 و 5"],
    },
    content: {
      type: String,
      required: [true, "يجب كتابة محتوى التقييم"],
      trim: true,
      minlength: [10, "محتوى التقييم يجب أن يكون على الأقل 10 أحرف"],
      maxlength: [500, "محتوى التقييم يجب أن لا يتجاوز 500 حرف"],
    },
    isPublic: {
      type: Boolean,
      default: false,
      select: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ user: 1 }, { unique: true });
reviewSchema.index({ createdAt: -1 });

// Populate user info when querying
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "fname lname email photo",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
