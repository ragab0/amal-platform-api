module.exports = function catchAsyncMiddle(middle) {
  return function mutatedMiddle(req, res, next) {
    middle(req, res, next).catch(next);
  };
};
