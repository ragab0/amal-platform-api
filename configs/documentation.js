const YAMLJS = require("yamljs");
const path = require("path");

const swaggerDocument = YAMLJS.load(
  path.join(__dirname, "../docs/openapi.yaml")
);
module.exports = swaggerDocument;
