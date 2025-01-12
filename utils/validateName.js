// Helper function to get validated name or default Arabic value
const getValidatedName = (providedName, isFirst = true) => {
  if (providedName && /^[\u0600-\u06FFa-zA-Z\s]{3,50}$/.test(providedName)) {
    return providedName;
  }
  return isFirst ? "مستخدم" : "جديد";
};

module.exports = getValidatedName;
