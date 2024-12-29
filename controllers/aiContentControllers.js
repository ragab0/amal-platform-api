const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const AppError = require("../utils/appError");
const { sendResult } = require("./handlers/send");
const { generateAIContent } = require("../services/aiService");
const { currentPropmps } = require("../services/ai/prompts");

exports.generateContent = catchAsyncMiddle(async (req, res, next) => {
  const { type, data } = req.body;

  if (!type || !data) {
    return next(new AppError("يرجى تقديم نوع المحتوى وبياناته", 400));
  }

  if (!currentPropmps.includes(type)) {
    throw new AppError("نوع المحتوى غير صالح", 400);
  }

  const content = await generateAIContent(type, data, req.user);
  sendResult(res, content);
});
