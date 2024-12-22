const Job = require("../models/jobModel");
const AppError = require("../utils/appError");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult, sendResults } = require("./handlers/send");

// Public
exports.getAllJobs = catchAsyncMiddle(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = { isActive: true };

  // Filter by type, experience, location if provided
  if (req.query.type) query.type = req.query.type;
  if (req.query.experience) query.experience = req.query.experience;
  if (req.query.location) query.location = req.query.location;

  // Salary range filter
  if (req.query.minSalary)
    query["salary.from"] = { $gte: parseInt(req.query.minSalary) };
  if (req.query.maxSalary)
    query["salary.to"] = { $lte: parseInt(req.query.maxSalary) };

  const totalCount = await Job.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const jobs = await Job.find(query).skip(skip).limit(limit).sort("-createdAt");

  sendResults(res, jobs, page, totalPages, totalCount);
});

// Route-Level authorization - admin only
exports.getAllJobsAdmin = catchAsyncMiddle(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await Job.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  const jobs = await Job.find()
    .populate("createdBy", "fname lname email")
    .select("+isActive +createdBy")
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  sendResults(res, jobs, page, totalPages, totalCount);
});

// Controller-Level authorization - admin anyone, user only himself
exports.getJob = catchAsyncMiddle(async (req, res, next) => {
  let query = { _id: req.params.jobId };

  // If not admin, only show active jobs
  if (req.user?.role !== "admin") {
    query.isActive = true;
  }

  const job = await Job.findOne(query)
    .populate("createdBy", "fname lname company")
    .select(req.user?.role === "admin" ? "+isActive" : "");

  if (!job) {
    return next(new AppError("الوظيفة غير موجودة", 404));
  }

  sendResult(res, job);
});

// Route-Level authorization - admin only
exports.createJob = catchAsyncMiddle(async (req, res) => {
  const newJob = await Job.create({
    ...req.body,
    createdBy: req.user._id,
  });

  sendResult(res, newJob);
});

// Controller-Level authorization - admin anyone, user only himself
exports.updateJob = catchAsyncMiddle(async (req, res, next) => {
  let job;
  if (req.user.role === "admin") {
    job = await Job.findById(req.params.jobId).select("+isActive");
  } else {
    job = await Job.findOne({
      _id: req.params.jobId,
      createdBy: req.user._id,
      isActive: true,
    });
  }

  if (!job) {
    return next(
      new AppError("الوظيفة غير موجودة أو غير مصرح لك بتعديلها", 404)
    );
  }

  // Prevent changing the creator
  if (req.body.createdBy) {
    delete req.body.createdBy;
  }

  Object.assign(job, req.body);
  await job.save({ runValidators: true });

  sendResult(res, job);
});

// Controller-Level authorization - admin anyone, user only himself
exports.deleteJob = catchAsyncMiddle(async (req, res, next) => {
  let job;
  if (req.user.role === "admin") {
    job = await Job.findById(req.params.jobId).select("+isActive");
  } else {
    job = await Job.findOne({
      _id: req.params.jobId,
      createdBy: req.user._id,
      isActive: true,
    });
  }

  if (!job) {
    return next(new AppError("الوظيفة غير موجودة أو غير مصرح لك بحذفها", 404));
  }

  job.isActive = false;
  await job.save({ validateBeforeSave: false });

  sendResult(res, null);
});
