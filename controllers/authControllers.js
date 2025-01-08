const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const crypto = require("crypto");
const CV = require("../models/cvModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
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
  console.log("token of cookie is:", token);
  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_CONFIG,
    expires: new Date(
      Date.now() + parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
  });
  return res;
}

// function setSession(req, user, token) {
//   req.session.user = {
//     id: user._id,
//     role: user.role,
//     token,
//   };
// }

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
        fullName: user.fname + " " + user.lname,
        headline: user.headline,
        photo: user.photo,
        phone: user.phone,
        email: user.email,
      },
    });
    await cv.save({ session });
    await session.commitTransaction();
    console.log("Commited transaction");
    sendResult(res, "تم التسجيل بنجاح", 201);
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
    return next(new AppError("يرجى تقديم عنوان بريد إلكتروني", 400));
  }

  const user = await User.findOne({ email: email.toLocaleLowerCase().trim() });
  if (!user) {
    return next(new AppError("عنوان البريد الإلكتروني غير صالح", 404));
  }

  if (user.isVerified) {
    return next(new AppError("البريد الإلكتروني موثق بالفعل", 400));
  }

  const verificationCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    const emailInstance = new Email(user);
    await emailInstance.sendVerificationCode(verificationCode);
    sendResult(res, {
      message: "تم إرسال رمز التحقق بنجاح",
    });
  } catch (error) {
    user.clearVerificationCode();
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقًا",
        500
      )
    );
  }
});

// Verify email with code
const verifyEmail = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  const { email, code } = req.body;

  if (!email || !code || typeof email !== "string") {
    return next(new AppError("يرجى تقديم البريد الإلكتروني ورمز التحقق!", 400));
  }

  const user = await User.findOne({
    email: email.toLocaleLowerCase().trim(),
  }).select(
    "+verificationCode +verificationCodeExpiresAt +countOfVerifiedCodes"
  );

  if (!user) {
    return next(new AppError("عنوان البريد الإلكتروني غير صالح!", 404));
  }

  if (!user.verifyCode(code)) {
    return next(new AppError("رمز التحقق غير صالح أو منتهي الصلاحية!", 400));
  }

  // Clear verification data after successful verification
  user.clearVerificationCode();
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setCookie(res, token);
  sendResult(res, {
    message: "تم التحقق من البريد الإلكتروني بنجاح!",
    token,
  });
});

// AUTH login
const login = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  const { email, password } = req.body;
  console.log("Login try for email:", email);

  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim() === "" ||
    password.trim() === ""
  ) {
    return next(
      new AppError("يرجى تقديم بريد إلكتروني وكلمة مرور صالحين", 400)
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
          "تم قفل الحساب بسبب محاولات فاشلة كثيرة. حاول مرة أخرى بعد دقيقة واحدة",
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
    return next(
      new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400)
    );
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
        message: "التحقق من البريد الإلكتروني مطلوب",
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
  sendResult(res, await user.getBasicInfo());
  console.log(
    `User ${user._id} logged in successfully at ${new Date().toISOString()}`
  );
});

const isLogin = catchAsyncMiddle(async function (req = rq, res = rs) {
  // protect middleware already validated;
  if (req.user.isVerified) {
    sendResult(res, await req.user.getBasicInfo());
  } else {
    sendResult(res, { isVerified: false }, 401);
  }
});

// AUTH protection
const protect = catchAsyncMiddle(async function (req = rq, res = rs, next) {
  let token;
  // console.log("Cookies:", { ...req.cookies });
  // console.log("Headers COOKIE:", req.headers.cookie);

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else {
    return next(new AppError("يرجى تسجيل الدخول أولاً!", 401));
  }

  // verified or JsonWebTokenError;
  const { id, iat } = verify(token, JWT_SECRET);
  // is the user not CUSTOMLY changed,deleted (by admin or db designer)
  const currentUser = await User.findById(id);
  if (!currentUser) {
    return next(new AppError("المستخدم لم يعد موجودا!", 400));
  }
  // is the user password has not been changed after the token iat;
  if (currentUser.isPasswordChangedAfter(iat)) {
    return next(
      new AppError("تم تغيير كلمة المرور، يرجى تسجيل الدخول مرة أخرى.", 400)
    );
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
        new AppError(`ك ${role}, لا تمتلك صلاحيات للقيام بهذا الإجراء!`, 403)
      );
    }
    next();
  });
};

const logout = catchAsyncMiddle(async function (req = rq, res = rs) {
  // Clear token cookie with all security options
  res.clearCookie(COOKIE_NAME, COOKIE_CONFIG);
  res.clearCookie("amal-oauth-session");

  // If user is logged in, update their instance
  if (req.user) {
    req.user.lastLogoutAt = new Date();
    await req.user.save({ validateBeforeSave: false });
  }

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
    return next(new AppError("يرجى تقديم عنوان بريد إلكتروني", 400));
  }

  // Find user and generate reset token
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("لا يوجد مستخدم بهذا البريد الإلكتروني", 404));
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
      message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    });
  } catch (err) {
    // Clear token and log error
    user.clearPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    console.error(
      `Failed to send password reset email to ${user._id}: ${err.message}`
    );
    return next(
      new AppError(
        "حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقًا",
        500
      )
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
      return next(new AppError("الرمز غير صالح أو منتهي الصلاحية", 400));
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
    sendResult(res, await user.getBasicInfo());
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
