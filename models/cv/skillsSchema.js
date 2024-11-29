// { type: [skill], default: [] }
const mongoose = require("mongoose");

const skill = mongoose.Schema({
  name: { type: String, required: [true, "Skill name is required."] },
  level: {
    type: Number,
    default: 100,
  },
});

const skillsSchema = new mongoose.Schema({
  description: String,
  interests: String,
  languages: {
    type: [skill],
  },
  otherSkills: {
    type: [skill],
  },
});

module.exports = skillsSchema;
