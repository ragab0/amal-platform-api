const mongoose = require("mongoose");

const deletedUserSchema = new mongoose.Schema(
  {
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: String,
  },
  { timestamps: true }
);

const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);
module.exports = DeletedUser;
