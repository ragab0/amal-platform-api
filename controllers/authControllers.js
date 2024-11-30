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
const {
  signupLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require("../utils/limiters");

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
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
  await new Promise((resolve) => signupLimiter(req, res, resolve));

  // Clean email
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.create([req.body], { session });
    const userInstance = user[0];

    await CV.create(
      [
        {
          user: userInstance._id,
          personalInfo: {
            fname: userInstance.fname,
            lname: userInstance.lname,
            headline: userInstance.headline,
            photo: userInstance.photo,
            phone: userInstance.phone,
            email: userInstance.email,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    const token = signToken(userInstance);
    setCookie(res, token);
    sendResult(res, userInstance.getBasicInfo(), 201);
  } catch (error) {
    await session.abortTransaction();
    throw error; // Let the global error handler handle it
  } finally {
    session.endSession();
  }
});

// AUTH login
const login = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  await new Promise((resolve) => loginLimiter(req, res, resolve)); // Apply rate limiter
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  } else if (typeof email !== "string" || typeof password !== "string") {
    return next(new AppError("Invalid input type!", 400));
  }

  // Find user with all required fields
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +loginAttempts +lockUntil"
  );

  // Check if account is locked
  if (user?.lockUntil > Date.now()) {
    const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return next(
      new AppError(
        `Account is locked. Try again in ${waitMinutes} minutes`,
        423
      )
    );
  }

  if (!user || !(await user.comparePassword(password, user.password))) {
    if (user) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.loginAttempts = 0;
        user.lockUntil = Date.now() + 0.5 * 60 * 1000; // .5 minutes
        await user.save({ validateBeforeSave: false });
        return next(
          new AppError(
            "Account locked due to too many failed attempts. Try again in .5 minutes",
            423
          )
        );
      }
      await user.save({ validateBeforeSave: false });
    }
    return next(new AppError("Invalid email or password", 401));
  }
  // Reset security fields on successful login
  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setCookie(res, token);
  sendResult(res, user.getBasicInfo());
  console.log(
    `User ${user._id} logged in successfully at ${new Date().toISOString()}`
  );
});

const isLogin = catchAsyncMiddle(async function (req = rq, res = rs) {
  // protect middleware already validated everything
  // and attached user to req.user
  sendResult(res, req.user.getBasicInfo());
});

// AUTH protection
const protect = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else {
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
    req.user.sessionCount = (req.user.sessionCount || 1) - 1;
    await req.user.save();

    // Log the logout for security tracking
    console.log(
      `User ${
        req.user._id
      } logged out successfully at ${new Date().toISOString()}`
    );
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
  // Apply rate limiter
  await new Promise((resolve) => forgotPasswordLimiter(req, res, resolve));

  // Clean email
  const email = req.body.email?.toLowerCase().trim();
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
  // Apply rate limiter
  await new Promise((resolve) => resetPasswordLimiter(req, res, resolve));

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

module.exports = {
  signup,
  login,
  protect,
  logout,
  isLogin,
  assignableTo,
  forgotPassword,
  resetPassword,
};
