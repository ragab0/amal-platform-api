const mongoose = require("mongoose");
const personalInfo = require("./cv/personalInfoSchema");
const professionalExperience = require("./cv/professionalExperienceSchema");
const skills = require("./cv/skillsSchema");
const education = require("./cv/educationSchema");
const reference = require("./cv/referenceSchema");

const cvSchema = new mongoose.Schema({
  personalInfo,
  professionalExperiences: { type: [professionalExperience], default: [] },
  skills,
  educations: { type: [education], default: [] },
  references: { type: [reference], default: [] },
});

const Cv = mongoose.model("Cv", cvSchema);
module.exports = Cv;
