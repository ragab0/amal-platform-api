const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  field: String,
  institute: String,
  city: String,
  country: String,
  degree: String,
  description: String,
  graduationDate: Date,
  // graduationDate: {
  //   type: Date,
  //   validate: {
  //     validator: function (value) {
  //       return value <= new Date();
  //     },
  //     message: "Graduation date cannot be in the future.",
  //   },
  // },
});

module.exports = educationSchema;
