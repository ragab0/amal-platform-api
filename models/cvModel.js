const mongoose = require("mongoose");
const personalInfo = require("./cv/personalInfoSchema");
const experience = require("./cv/professionalExperienceSchema");
const skillsContainer = require("./cv/skillsContainer");
const education = require("./cv/educationSchema");
const reference = require("./cv/referenceSchema");
const volunteerSchema = require("./cv/volunteerSchema");
const coursesContainer = require("./cv/coursesSchema");
const options = require("./cv/optionsSchema");

const cvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false, // For deleting simuulation BY ADMIN;
  },
  personalInfo,
  experiences: { type: [experience], default: [] },
  allSkills: { type: skillsContainer, default: {} },
  educations: { type: [education], default: [] },
  volunteers: { type: [volunteerSchema], default: [] },
  courses: { type: [coursesContainer], default: [] },
  references: { type: [reference], default: [] },
  options: { type: options, default: {} },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cvSchema.index({ user: 1 });

const Cv = mongoose.model("Cv", cvSchema);
module.exports = Cv;
