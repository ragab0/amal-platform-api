const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const currentPlan = new mongoose.Schema({
  isFree: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required."],
  },
  endDate: {
    type: Date,
    required: [true, "Snd date is required."],
  },
});

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "First name is required."],
      minlength: [3, "First name must be at least 3 characters long."],
      maxlength: [50, "First name cannot exceed 50 characters."],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s'-]+$/.test(value);
        },
        message:
          "First name must only contain letters, spaces, hyphens, or apostrophes.",
      },
    },
    lname: {
      type: String,
      required: [true, "Last name is required."],
      minlength: [3, "Last name must be at least 3 characters long."],
      maxlength: [50, "Last name cannot exceed 50 characters."],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s'-]+$/.test(value);
        },
        message:
          "Last name must only contain letters, spaces, hyphens, or apostrophes.",
      },
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message:
          "Email address must be in the pattern of (/^[^s@]+@[^s@]+.[^s@]+$/).",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        },
        message:
          "Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password confirmation is required."],
      minlength: [
        8,
        "Password confirmation must be at least 8 characters long.",
      ],
      select: false,
      validate: {
        validator: function (curr) {
          return curr === this.password;
        },
      },
      message: "Passwords do not match.",
    },
    role: {
      type: String,
      required: [true, "Role is required."],
      enum: {
        values: ["user"],
        message: `Role must be one of ["user"]`,
      },
    },
    passwordChangedAt: Date,
    photo: String,
    phone: {
      type: String,
      validate: {
        validator: function (value) {
          return /^\+?\d{10,15}$/.test(value); // international and local formats
        },
        message: "Phone number must be valid.",
      },
    },
    language: {
      type: String,
      enum: {
        values: ["en", "ar"],
        message: `Language must be one of ["en", "ar"]`,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    currentPlan: {
      type: currentPlan,
      select: false,
    },
  },
  { timestamps: true }
);

/** model hooks */

// hashing whenever the password get modified;
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

/* instances mehtods - added to each doc prototype; */

// password comparing
userSchema.methods.comparePassword = async function (candiatePass, userPass) {
  return await bcrypt.compare(candiatePass, userPass);
};

// after the JWT created;
userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  console.log(JWTTimestamp, this.passwordChangedAt);
  return this.passwordChangedAt && this.passwordChangedAt < JWTTimestamp;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
