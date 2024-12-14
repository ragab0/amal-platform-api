const mongoose = require("mongoose");
const personalInfo = require("./cv/personalInfoSchema");
const experience = require("./cv/professionalExperienceSchema");
const skills = require("./cv/skillsSchema");
const education = require("./cv/educationSchema");
const reference = require("./cv/referenceSchema");

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
  skills,
  educations: { type: [education], default: [] },
  references: { type: [reference], default: [] },
});

// Function to drop all indexes except _id
// cvSchema.statics.dropIndexes = async function() {
//   try {
//     await this.collection.dropIndexes();
//     console.log('Successfully dropped indexes from CV collection');
//   } catch (error) {
//     console.error('Error dropping indexes:', error);
//   }
// };

cvSchema.index({ user: 1 });

const Cv = mongoose.model("Cv", cvSchema);
module.exports = Cv;
