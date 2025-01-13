const mongoose = require("mongoose");

const optionsSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: [true, "يجب تحديد القالب"],
    },
    currentFontOptions: {
      fontFamily: {
        type: String,
        default: "cairo",
      },
      fontSize: {
        type: Number,
        default: 11,
      },
      titleFontSize: {
        type: Number,
        default: 15,
      },
    },
    currentSupportedColors: {
      type: [String],
      default: [],
    },
    allowedSectionsFields: {
      type: Map,
      of: {
        arabicTitle: {
          type: String,
          required: true,
        },
        fields: {
          type: Map,
          of: {
            arabicName: {
              type: String,
              required: true,
            },
            isSelected: {
              type: Boolean,
              default: true,
            },
          },
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = optionsSchema;
