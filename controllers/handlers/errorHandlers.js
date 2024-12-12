const AppError = require("../../utils/appError");
const { NODE_ENV } = process.env;

module.exports = function mainErrorController(err, req, res, next) {
  console.error("FROM mainErrorController THERE IS AN ERROR:", err);
  console.error("THE ERROR STACK:", err.stack);

  if (!err.isOperational) {
    if (err.name === "ValidationError") {
      err = handleMongodbValidationError(err);
    } else if (err.code === 11000) {
      err = handleMongodbDuplicateFieldsError(err);
    } else if (err.name === "MongooseError") {
      err = handleMongooseError(err);
    } else if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
      err = handleJWTErrors(err);
    } else if (err.name === "PayloadTooLargeError") {
      err = handlePayloadError(err);
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else {
      if (NODE_ENV === "development") {
        err = globalHandlerDev(err);
      } else {
        err = globalHandlerPro();
      }
    }
  }

  return res.status(err.statusCode).json({
    [err.errs ? "results" : "result"]: err.errs || err.message,
    status: err.status,
    payload: err.payload,
    forDevError: NODE_ENV === "development" ? err : undefined,
    forDevErrorStack: NODE_ENV === "development" ? err.stack : undefined,
  });
};

function handleMongodbValidationError(err) {
  const operationalError = new AppError("Invalid data", 400);
  operationalError.errs = Object.keys(err.errors).map((k) => ({
    [k]: err.errors[k].message,
  }));
  return operationalError;
}

function handleMongodbDuplicateFieldsError(err) {
  console.log(err);
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Email ${value} already exists. Please use another email.`;
  return new AppError(message, 400);
}

function handleMongooseError(err) {
  return new AppError("DB connection is failed! please report us", 500);
}

function handleJWTErrors(err) {
  const operationalError = new AppError(
    "For your security. Please log in again!",
    401
  );
  return operationalError;
}

function handlePayloadError(err) {
  const operationalError = new AppError("Data is too large to process!", 404);
  return operationalError;
}

// global handler for dev mode
function globalHandlerDev(err) {
  err.statusCode = 500;
  err.status = "error";
  err.isOperational = "yep";
  return err;
}
// global handler for pro mode
function globalHandlerPro() {
  return new AppError("Something went wrong!", 500);
}
