const mongoose = require("mongoose");

const professionalExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  city: String,
  country: String,
  startDate: {
    type: Date,
    required: [true, "Start date is required."],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required."],
    validate: {
      validator: function (value) {
        return !this.startDate || value >= this.startDate;
      },
      message: "End date must be after start date.",
    },
  },
  description: {
    type: String,
    // required: [true, "Description is required."],
  },
});

module.exports = professionalExperienceSchema;
