const mongoose = require("mongoose");

const coursesContainer = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, "اسم الدورة مطلوب"],
  },
  instituteName: {
    type: String,
    required: [true, "اسم المعهد/المؤسسة مطلوب"],
  },
  startDate: Date,
  endDate: Date,
  description: String,
});

module.exports = coursesContainer;
