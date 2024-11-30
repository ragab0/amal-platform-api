const Template = require("../models/templateModel");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

exports.getAllTemplates = catchAsyncMiddle(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Find total count of documents
  const totalCount = await Template.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  // Find templates with pagination
  const templates = await Template.find().skip(skip).limit(limit);

  // Send paginated results
  sendResults(res, templates, page, totalPages, totalCount);
  next();
});

exports.createTemplate = catchAsyncMiddle(async (req, res, next) => {
  const newTemplate = await Template.create(req.body);
  sendResult(res, newTemplate, 201);
  next();
});

exports.getTemplate = catchAsyncMiddle(async (req, res, next) => {
  const template = await Template.findById(req.params.tempId);

  if (!template) {
    return res.status(404).json({
      status: "fail",
      message: "Template not found",
    });
  }

  sendResult(res, template);
  next();
});

exports.updateTemplate = catchAsyncMiddle(async (req, res, next) => {
  const updatedTemplate = await Template.findByIdAndUpdate(
    req.params.tempId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedTemplate) {
    return res.status(404).json({
      status: "fail",
      message: "Template not found",
    });
  }

  sendResult(res, updatedTemplate);
  next();
});

exports.deleteTemplate = catchAsyncMiddle(async (req, res, next) => {
  const deletedTemplate = await Template.findByIdAndDelete(req.params.tempId);

  if (!deletedTemplate) {
    return res.status(404).json({
      status: "fail",
      message: "Template not found",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
  next();
});
