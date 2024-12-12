const CV = require("../models/cvModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const crypto = require("crypto");
const { response: rs, request: rq } = require("express");
const { sign, verify } = require("jsonwebtoken");
const { sendResult } = require("./handlers/send");
const { default: mongoose } = require("mongoose");
const { COOKIE_CONFIG } = require("../configs/headerCookies");

const { JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL } = process.env;
const COOKIE_NAME = "jwt";

function signToken(user = {}) {
  const payload = {
    id: user._id,
    role: user.role,
    version: user.passwordChangedAt ? user.passwordChangedAt.getTime() : 0,
  };
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function setCookie(res = rs, token) {
  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_CONFIG,
    expires: new Date(
      Date.now() + parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
  });
  return res;
}

// AUTH signup
const signup = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  if (req.body.email) req.body.email = req.body.email.toLowerCase().trim();

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = new User(req.body);
    await user.save({ session });

    const cv = new CV({
      user: user._id,
      personalInfo: {
        fname: user.fname,
        lname: user.lname,
        headline: user.headline,
        photo: user.photo,
        phone: user.phone,
        email: user.email,
      },
    });
    await cv.save({ session });
    await session.commitTransaction();
    console.log("Commited transaction");
    sendResult(res, "Done", 201);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Generate verification code
const generateVerificationCode = catchAsyncMiddle(async function (
  req = rq,
  res = rs,
  next
) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return next(new AppError("Please provide email address!", 400));
  }

  const user = await User.findOne({ email: email.toLocaleLowerCase().trim() });
  if (!user) {
    return next(new AppError("Invalid email address!", 404));
  }

  if (user.isVerified) {
    return next(new AppError("Email is already verified!", 400));
  }

  const verificationCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    const emailInstance = new Email(user);
    await emailInstance.sendVerificationCode(verificationCode);
    sendResult(res, {
      message: "Verification code sent successfully!",
    });
  } catch (error) {
    user.clearVerificationCode();
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "Failed to send verification code. Please try again later.",
        500
      )
    );
  }
});

// Verify email with code
const verifyEmail = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  const { email, code } = req.body;

  if (!email || !code || typeof email !== "string") {
    return next(
      new AppError("Please provide both email and verification code!", 400)
    );
  }

  const user = await User.findOne({
    email: email.toLocaleLowerCase().trim(),
  }).select(
    "+verificationCode +verificationCodeExpiresAt +countOfVerifiedCodes"
  );

  if (!user) {
    return next(new AppError("Invalid email address!", 404));
  }

  if (!user.verifyCode(code)) {
    return next(new AppError("Invalid or expired verification code!", 400));
  }

  // Clear verification data after successful verification
  user.clearVerificationCode();
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setCookie(res, token);
  sendResult(res, {
    message: "Email verified successfully!",
  });
});

// AUTH login
const login = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    console.log("Invalid input validation:", { email, password });
    return next(
      new AppError("Please provide a valid email and password", 400, {
        email,
        password,
      })
    );
  }

  // Find user with all required fields && check credentials
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +loginAttempts +lockUntil"
  );

  if (user) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.loginAttempts = 0;
      user.lockUntil = Date.now() + 1 * 60 * 1000; // 1 min
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "Account locked due to too many failed attempts. Try again after 1 minue",
          423
        )
      );
    }
    await user.save({ validateBeforeSave: false });
  }

  if (
    !user ||
    !user.password ||
    !(await user.comparePassword(password, user.password))
  ) {
    return next(new AppError("Invalid email or password", 400));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
  }

  // Check if email is verified
  // Using 303 See Other to indicate the user should be redirected to a different resource
  if (!user.isVerified) {
    return sendResult(
      res,
      {
        message: "Email verification required",
        payload: {
          isVerified: false,
          email: user.email,
          redirectTo: "/verify-email",
        },
      },
      303
    );
  }

  // If everything ok, send token
  const token = signToken(user);
  setCookie(res, token);
  console.log("Login successful, token created");

  sendResult(res, user.getBasicInfo());
  console.log(
    `User ${user._id} logged in successfully at ${new Date().toISOString()}`
  );
});

const isLogin = catchAsyncMiddle(async function (req = rq, res = rs) {
  // protect middleware already validated;
  if (req.user.isVerified) {
    sendResult(res, req.user.getBasicInfo());
  } else {
    sendResult(res, { isVerified: false }, 401);
  }
});

// AUTH protection
const protect = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  let token;
  console.log("Cookies:", { ...req.cookies });
  console.log("Headers:", req.headers.authorization);

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else {
    return sendResult(res);
    return next(new AppError("Login to get access!", 401));
  }

  // verified or JsonWebTokenError;
  const { id, iat } = verify(token, JWT_SECRET);
  // is the user not CUSTOMLY changed,deleted (by admin or db designer)
  const currentUser = await User.findById(id);
  if (!currentUser) {
    return next(new AppError("User doesn't longer exist!", 401));
  }
  // is the user password has not been changed after the token iat;
  if (currentUser.isPasswordChangedAfter(iat)) {
    return next(new AppError("Password has been changed, login again.", 401));
  }
  // pass the current user to the next middles that was requires protection;
  req.user = currentUser;
  next();
});

// autho persmissions
const assignableTo = function (...roles) {
  return catchAsyncMiddle(async function (req = rq, _, next) {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return next(
        new AppError(
          `As ${role}, you don't have permision to perfrom this action!`,
          403
        )
      );
    }
    next();
  });
};

const logout = catchAsyncMiddle(async function (req = rq, res = rs) {
  // Clear token cookie with all security options
  res.clearCookie(COOKIE_NAME, COOKIE_CONFIG);

  // If user is logged in, update their instance
  if (req.user) {
    req.user.lastLogoutAt = new Date();
    await req.user.save({ validateBeforeSave: false });
  }

  // Clear any other session-related cookies if exist
  const cookies = Object.keys(req.cookies);
  cookies.forEach((cookie) => {
    res.clearCookie(cookie, COOKIE_CONFIG);
  });

  // Send success response
  sendResult(res, null, 200);
});

const forgotPassword = catchAsyncMiddle(async function (
  req = rq,
  res = rs,
  next
) {
  // Clean email
  const email = req.body.email?.toLocaleLowerCase().trim();
  if (!email) {
    return next(new AppError("Please provide your email address", 400));
  }

  // Find user and generate reset token
  const user = await User.findOne({ email });

  if (!user) {
    // Log for monitoring without reveal to client
    console.log(`Password reset attempted for non-existent email: ${email}`);
    return sendResult(res, {
      message:
        "If this email exists, password reset instructions will be sent.",
    });
  }

  try {
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    // Send password reset email
    await Email.sendPasswordReset(user.email, resetURL);

    // Log for security monitoring
    console.log(
      `Password reset token generated for user ${
        user._id
      } at ${new Date().toISOString()}`
    );

    sendResult(res, {
      message:
        "If this email exists, password reset instructions will be sent.",
    });
  } catch (err) {
    // Clear token and log error
    user.clearPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    console.error(
      `Failed to send password reset email to ${user._id}: ${err.message}`
    );
    return next(
      new AppError("Error sending password reset email. Try again later.", 500)
    );
  }
});

const resetPassword = catchAsyncMiddle(async function (
  req = rq,
  res = rs,
  next
) {
  try {
    // Hash token for comparison
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user and validate token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    // Update password and clear reset token
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save(); // Schema validation will handle password requirements

    // Log password change
    console.log(
      `Password reset successful for user ${
        user._id
      } at ${new Date().toISOString()}`
    );

    // Log user in
    const token = signToken(user);
    setCookie(res, token);

    // Send minimal user info
    sendResult(res, user.getBasicInfo());
  } catch (err) {
    console.error(`Password reset failed: ${err.message}`);
    return next(
      new AppError("Failed to reset password. Please try again.", 500)
    );
  }
});

// Provider Auth callback
const providerCallback = catchAsyncMiddle(async (req = rq, res = rs, next) => {
  const token = signToken(req.user);
  setCookie(res, token);
  // Redirect to frontend home page with success query param
  res.redirect(`${FRONTEND_URL}/auth/callback?auth=success`);
});

module.exports = {
  signup,
  login,
  logout,
  protect,
  isLogin,
  verifyEmail,
  generateVerificationCode,
  forgotPassword,
  providerCallback,
  assignableTo,
  resetPassword,
};
