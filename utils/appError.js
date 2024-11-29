// a global error form/schema that all our created errors will look like - to differenciate between ours and system errors;
module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
  }
};
