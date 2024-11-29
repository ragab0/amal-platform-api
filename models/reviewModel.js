const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
