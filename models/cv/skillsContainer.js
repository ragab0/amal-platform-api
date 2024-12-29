const mongoose = require("mongoose");

const skill = new mongoose.Schema({
  name: { type: String, required: [true, "اسم المهارة مطلوب"] },
  levelPercentage: {
    type: Number,
    default: 100,
  },
  levelText: {
    type: String,
    default: "",
  },
});

const skillsContainer = new mongoose.Schema({
  description: String,
  interests: String,
  languages: {
    type: [skill],
  },
  softSkills: {
    type: [skill],
  },
  otherSkills: {
    type: [skill],
  },
});

module.exports = skillsContainer;
