const mongoose = require("mongoose");

const referenceSchema = new mongoose.Schema({
  description: String,
  personName: String,
  company: String,
  email: String,
  phone: String,
  graduationDate: Date,
});

module.exports = referenceSchema;
