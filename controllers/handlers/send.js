function sendResults(res, results = [], page, totalPages, count = null) {
  res.status(200).json({
    status: "success",
    results,
    page,
    totalPages,
    count: count || results.length,
  });
}

function sendResult(res, result, statusCode) {
  res.status(statusCode || result ? 200 : 204).json({
    status: "success",
    result,
  });
}

module.exports = {
  sendResult,
  sendResults,
};
