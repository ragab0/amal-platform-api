const mongoose = require("mongoose");

const professionalExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  city: String,
  country: String,
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !this.startDate || value >= this.startDate;
      },
      message: "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء",
    },
  },
  description: String,
});

module.exports = professionalExperienceSchema;
