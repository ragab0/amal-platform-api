const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    content: String,
    count: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;
