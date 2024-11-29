const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "Please type the first name!"],
    minlength: 3,
  },
  lname: {
    type: String,
    required: [true, "Please type the last name!"],
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, "Please type an email!"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please type a password!"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    minlength: 8,
    select: false,
    validate: {
      validator: function (curr) {
        return curr === this.password;
      },
    },
  },
  role: {
    type: String,
    required: [true, "Please specify your role!"],
    validate: {
      validator: function (val) {
        return ["student"].includes(val);
      },
      message: "`{VALUE}` must be either (student)",
    },
    enum: {
      values: ["student"],
    },
  },
  passwordChangedAt: Date,
  photo: String,
  headline: String,
  description: String,
  language: String,
  links: Array(Object),
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
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

// password comparing
userSchema.methods.comparePassword = async function (candiatePass, userPass) {
  console.log(candiatePass, userPass);
  return await bcrypt.compare(candiatePass, userPass);
};

// after the JWT created;
userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  console.log(JWTTimestamp, this.passwordChangedAt);
  return this.passwordChangedAt && this.passwordChangedAt < JWTTimestamp;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
