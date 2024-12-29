const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  field: String,
  institute: String,
  city: String,
  country: String,
  degree: String,
  description: String,
  graduationDate: Date,
});

module.exports = educationSchema;
