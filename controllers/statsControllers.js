const Job = require("../models/jobModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");
const { sendResult } = require("./handlers/send");

exports.getStats = catchAsyncMiddle(async (req, res, next) => {
  // Get user statistics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        normalUsers: {
          $sum: {
            $cond: [{ $eq: ["$role", "user"] }, 1, 0],
          },
        },
        adminUsers: {
          $sum: {
            $cond: [{ $eq: ["$role", "admin"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get job statistics
  const jobStats = await Job.aggregate([
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        activeJobs: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
        inactiveJobs: {
          $sum: {
            $cond: [{ $eq: ["$isActive", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get total reviews count
  const reviewCount = await Review.countDocuments();

  // Format the response
  const stats = {
    users: {
      total: userStats[0]?.totalUsers || 0,
      normal: userStats[0]?.normalUsers || 0,
      admin: userStats[0]?.adminUsers || 0,
    },
    jobs: {
      total: jobStats[0]?.totalJobs || 0,
      active: jobStats[0]?.activeJobs || 0,
      inactive: jobStats[0]?.inactiveJobs || 0,
    },
    reviews: {
      total: reviewCount,
    },
  };

  sendResult(res, stats);
});
