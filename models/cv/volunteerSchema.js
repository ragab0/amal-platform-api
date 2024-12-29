const mongoose = require("mongoose");

const volunteerContainer = new mongoose.Schema({
  title: { type: String, required: [true, "عنوان العمل التطوعي مطلوب"] },
  description: String,
  startDate: Date,
  endDate: Date,
});

module.exports = volunteerContainer;
// descriptions: [{ type: String }],
