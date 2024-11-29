const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { request: req, response: res } = require("express");
const { sign, verify } = require("jsonwebtoken");
const { sendResult } = require("./handlers/send");
const User = require("../models/userModel");

const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = process.env;
const COOKIE_NAME = "jwt";

function signToken(user = {}) {
  const payload = {
    id: user._id,
    role: user.role,
  };
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function setCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    expires: new Date(
      Date.now() + parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    secure: NODE_ENV !== "development",
    httpOnly: true,
    sameSite: "None",
  });
  return res;
}

// AUTH signup
const signup = catchAsyncMiddle(async function (req = req, res = res, next) {
  const user = await User.create(req.body);
  const token = signToken(user);
  setCookie(res, token);
  sendResult(res, user.getBasicInfo(), 201);
});

// AUTH login
const login = catchAsyncMiddle(async function (req = req, res = res, next) {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  let user = await User.findOne({ email }).select("+password");

  // check if the user exists in db && password is valid - otherwise
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("The email or password isn't correct!", 401));
  }
  const token = signToken(user);
  setCookie(res, token);
  sendResult(res, user.getBasicInfo(), 201);
});

const isLogin = catchAsyncMiddle(async function (req = req, res = res) {
  sendResult(res, req.user.getBasicInfo());
});

// AUTH protection
const protect = catchAsyncMiddle(async function (req = req, res = res, next) {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.cookie) {
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
    return next(
      new AppError(
        "Password recently has been changed. Please login again!",
        401
      )
    );
  }
  // pass the current user to the next middles that was requires protection;
  req.user = currentUser;
  next();
});

// autho persmissions
const assignableTo = function (...roles) {
  return catchAsyncMiddle(async function (req = req, _ = res, next) {
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

const logout = catchAsyncMiddle(async function (req = req, res = res, next) {
  next();
});

const forgotPassword = catchAsyncMiddle(async function (
  req = req,
  res = res,
  next
) {
  next();
});

module.exports = {
  signup,
  login,
  isLogin,
  protect,
  assignableTo,
  logout,
  forgotPassword,
};
