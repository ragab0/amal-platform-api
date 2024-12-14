const mongoose = require("mongoose");

const referenceSchema = new mongoose.Schema({
  description: String,
  fullName: String,
  company: String,
  email: String,
  phone: String,
  graduationDate: Date,
});

module.exports = referenceSchema;
