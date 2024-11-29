const mongoose = require("mongoose");
const User = require("../userModel");

const personalInfoSchema = new mongoose.Schema({
  fname: User.schema.obj.fname,
  lname: User.schema.obj.lname,
  photo: User.schema.obj.photo,
  email: User.schema.obj.email,
  phone: User.schema.obj.phone,
  headline: {
    type: String,
    required: [true, "Headline is required."],
    minlength: [3, "Headline must be at least 3 characters long."],
    maxlength: [50, "Headline cannot exceed 50 characters."],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z\s'-]+$/.test(value);
      },
      message:
        "Headline must only contain letters, spaces, hyphens, or apostrophes.",
    },
  },
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
