const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
    required: [true, "End date is required."],
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
          return /^[\u0600-\u06FFa-zA-Z\s]+$/.test(value);
        },
        message: "First name ",
      },
    },
    lname: {
      type: String,
      required: [true, "Last name is required."],
      minlength: [3, "Last name must be at least 3 characters long."],
      maxlength: [50, "Last name cannot exceed 50 characters."],
      validate: {
        validator: function (value) {
          return /^[\u0600-\u06FFa-zA-Z\s]+$/.test(value);
        },
        message: "Last name ",
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email address is required."],
      lowercase: true,
      maxlength: [255, "Email address cannot exceed 255 characters."],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },
        message:
          "Email address must be in the pattern of (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/).",
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    headline: {
      type: String,
      required: [true, "Headline is required."],
      minlength: [3, "Headline must be at least 3 characters long."],
      maxlength: [128, "Headline cannot exceed 128 characters."],
      validate: {
        validator: function (value) {
          return /^[\u0600-\u06FFa-zA-Z\s_\|\-]+$/.test(value);
        },
        message:
          "Headline must only contain letters, on space or the symbols (_|-) between each word",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      maxlength: [128, "Password cannot exceed 128 characters."],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d\s!@#$%^&*(),.?":{}|<>]{8,128}$/.test(
            value
          );
        },
        message:
          "Password must be 8-128 characters long, include uppercase and lowercase letters, numbers, and special characters.",
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
      maxlength: [128, "Password confirmation cannot exceed 128 characters."],
      select: false,
      validate: {
        validator: function (curr) {
          return curr === this.password;
        },
        message: "Passwords do not match.",
      },
    },
    role: {
      type: String,
      required: [true, "Role is required."],
      enum: {
        values: ["user"],
        message: `Role must be one of ["user"]`,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpiresAt: {
      type: Date,
      select: false,
    },
    countOfVerifiedCodes: {
      type: Number,
      default: 0,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    photo: String,
    country: String,
    phone: {
      type: String,
      minlength: [7, "رقم الهاتف يجب أن يكون على الأقل 7 ارقام"],
      maxlength: [15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم"],
      validate: {
        validator: function (value) {
          return /^\+?[0-9\s-]{7,15}$/.test(value); // international and local formats
        },
        message: "رقم الهاتف غير صالح.",
      },
    },
    language: {
      type: String,
      default: "ar",
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

userSchema.methods.comparePassword = async function (candiatePass, userPass) {
  return await bcrypt.compare(candiatePass, userPass);
};

userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  console.log(JWTTimestamp, this.passwordChangedAt);
  return this.passwordChangedAt && this.passwordChangedAt < JWTTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // Generate random token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.clearPasswordResetToken = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

userSchema.methods.getBasicInfo = function () {
  return {
    _id: this._id,
    fname: this.fname,
    lname: this.lname,
    email: this.email,
    headline: this.headline,
    role: this.role,
    photo: this.photo,
    phone: this.phone,
    language: this.language,
  };
};

/** for signup controller */

// Generate a 6-digit code & Hash the code before saving:
userSchema.methods.createVerificationCode = function () {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  this.verificationCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  // Set expiration to 10 minutes & Return unhashed code for sending via email:
  this.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  this.countOfVerifiedCodes += 1;
  return verificationCode;
};

// Verify the code
userSchema.methods.verifyCode = function (code) {
  console.log(
    this.verificationCodeExpiresAt,
    this.countOfVerifiedCodes,
    code,
    this
  );

  if (
    !this.verificationCodeExpiresAt ||
    this.verificationCodeExpiresAt < Date.now()
  ) {
    return false;
  }

  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  return this.verificationCode === hashedCode;
};

// Clear verification data
userSchema.methods.clearVerificationCode = function () {
  this.verificationCode = undefined;
  this.verificationCodeExpiresAt = undefined;
};

// Set new password directly without validation
userSchema.methods.setNewPassword = async function (newPassword) {
  this.password = newPassword;
  this.passwordConfirm = newPassword;
  this.passwordChangedAt = Date.now();
};

const User = mongoose.model("User", userSchema);

(async () => {
  console.log(await User.countDocuments());
})();

module.exports = User;
