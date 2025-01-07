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
    required: [true, "تاريخ البدء مطلوب"],
  },
  endDate: {
    type: Date,
    required: [true, "تاريخ الانتهاء مطلوب"],
  },
});

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "الاسم الأول مطلوب"],
      minlength: [3, "يجب أن يكون الاسم الأول 3 أحرف على الأقل"],
      maxlength: [50, "لا يمكن أن يتجاوز الاسم الأول 50 حرفًا"],
      validate: {
        validator: function (value) {
          return /^[\u0600-\u06FFa-zA-Z\s]+$/.test(value);
        },
        message: "الاسم الأول يجب أن يحتوي على حروف عربية أو إنجليزية فقط",
      },
    },
    lname: {
      type: String,
      required: [true, "اسم العائلة مطلوب"],
      minlength: [3, "يجب أن يكون اسم العائلة 3 أحرف على الأقل"],
      maxlength: [50, "لا يمكن أن يتجاوز اسم العائلة 50 حرفًا"],
      validate: {
        validator: function (value) {
          return /^[\u0600-\u06FFa-zA-Z\s]+$/.test(value);
        },
        message: "اسم العائلة يجب أن يحتوي على حروف عربية أو إنجليزية فقط",
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, "البريد الإلكتروني مطلوب"],
      lowercase: true,
      maxlength: [255, "لا يمكن أن يتجاوز البريد الإلكتروني 255 حرفًا"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },
        message:
          "البريد الإلكتروني يجب أن يكون في الشكل الصحيح (مثال: example@example.com)",
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    headline: {
      type: String,
      required: [true, "العنوان مطلوب"],
      minlength: [3, "يجب أن يكون العنوان 3 أحرف على الأقل"],
      maxlength: [128, "لا يمكن أن يتجاوز العنوان 128 حرفًا"],
      validate: {
        validator: function (value) {
          return /^[\u0600-\u06FFa-zA-Z\s_\|\-]+$/.test(value);
        },
        message: "يجب أن يحتوي العنوان على حروف فقط، مع مسافات أو الرموز (_|-)",
      },
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل"],
      maxlength: [128, "لا يمكن أن تتجاوز كلمة المرور 128 حرفًا"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d\s!@#$%^&*(),.?":{}|<>]{8,128}$/.test(
            value
          );
        },
        message:
          "يجب أن تحتوي كلمة المرور على 8-128 حرفًا، وتشمل أحرفًا كبيرة وصغيرة وأرقامًا ورموزًا خاصة",
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "تأكيد كلمة المرور مطلوب"],
      minlength: [8, "يجب أن يكون تأكيد كلمة المرور 8 أحرف على الأقل"],
      maxlength: [128, "لا يمكن أن يتجاوز تأكيد كلمة المرور 128 حرفًا"],
      validate: {
        validator: function (curr) {
          return curr === this.password;
        },
        message: "كلمات المرور غير متطابقة",
      },
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["user"],
        message: "الدور يجب أن يكون مستخدم فقط user",
      },
      default: "user",
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
      enum: {
        values: ["en", "ar"],
        message: "اللغة غير صحيحة, يمكن استخدام 'en' و 'ar' فقط",
      },
      default: "ar",
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for user's review
userSchema.virtual("myReview", {
  ref: "Review",
  foreignField: "user",
  localField: "_id",
  justOne: true, // Since each user can have only one review
});
// Pre-find middleware to populate review
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "myReview",
  });
  next();
});

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
    myReview: this.myReview,
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
