const mongoose = require("mongoose");
const User = require("../userModel");

const personalInfoSchema = new mongoose.Schema({
  fname: User.schema.obj.fname,
  lname: User.schema.obj.lname,
  photo: User.schema.obj.photo,
  email: {
    ...User.schema.obj.email,
    unique: false  // Override the unique constraint from User schema
  },
  phone: User.schema.obj.phone,
  headline: User.schema.obj.headline,
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
