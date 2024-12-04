const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: [true, "Review must belong to user."],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating must be at most 5."],
    },
    content: String,
  },
  { timestamps: true }
);

// Add index for better query performance
reviewSchema.index({ user: 1 });

// Pre-find hook to automatically populate user data
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'fname lname photo'
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
