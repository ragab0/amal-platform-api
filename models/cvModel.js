const mongoose = require("mongoose");
const personalInfo = require("./cv/personalInfoSchema");
const experience = require("./cv/professionalExperienceSchema");
const skillsContainer = require("./cv/skillsContainer");
const education = require("./cv/educationSchema");
const reference = require("./cv/referenceSchema");
const volunteerSchema = require("./cv/volunteerSchema");
const coursesContainer = require("./cv/coursesSchema");

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
});

cvSchema.index({ user: 1 });

const Cv = mongoose.model("Cv", cvSchema);
module.exports = Cv;
