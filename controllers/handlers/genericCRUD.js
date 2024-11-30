// Generic CRUD handlers;
const { sendResult, sendResults } = require("./send");
const catchAsyncMiddle = require("../../utils/catchAsyncMiddle");

exports.createOne = (Model) =>
  catchAsyncMiddle(async (req, res, next) => {
    const doc = await Model.create(req.body);
    sendResult(res, doc, 201);
  });

exports.updateOne = (Model) =>
  catchAsyncMiddle(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: `No document found with that ID`,
      });
    }

    sendResult(res, doc);
  });

exports.deleteOne = (Model) =>
  catchAsyncMiddle(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: `No document found with that ID`,
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsyncMiddle(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: `No document found with that ID`,
      });
    }

    sendResult(res, doc);
  });

exports.getAll = (Model) =>
  catchAsyncMiddle(async (req, res, next) => {
    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "limit", "sort", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Model.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }

    // Execute query
    const totalCount = await Model.countDocuments(JSON.parse(queryStr));
    const totalPages = Math.ceil(totalCount / limit);

    const docs = await query.skip(skip).limit(limit);

    // Send paginated results
    sendResults(res, docs, page, totalPages, totalCount);
  });

// Example usage in a specific controller file
// const CV = require('../models/CVModel');
// const factory = require('./handlerFactory');
//
// exports.getAllCVs = factory.getAll(CV);
// exports.createCV = factory.createOne(CV);
// exports.getCV = factory.getOne(CV);
// exports.updateCV = factory.updateOne(CV);
// exports.deleteCV = factory.deleteOne(CV);
