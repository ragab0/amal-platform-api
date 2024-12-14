const mongoose = require("mongoose");
const User = require("../userModel");

const personalInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required."],
  },
  email: {
    ...User.schema.obj.email,
    unique: false,
  },
  phone: User.schema.obj.phone, // With validation BUT optional
  photo: String,
  headline: String,
  city: String,
  country: String,
  birthDate: Date,
  nationality: String,
  driveLicense: String,
  civilStatus: String,
  linkedIn: String,
  portfolio: String,
  description: String,
});

module.exports = personalInfoSchema;
