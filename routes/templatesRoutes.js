const templatesControllers = require("../controllers/templatesControllers");
const templatesRouter = require("express").Router();

templatesRouter
  .route("/")
  .get(templatesControllers.getAllTemplates)
  .post(templatesControllers.createTemplate);
templatesRouter
  .route("/:tempId")
  .get(templatesControllers.getTemplate)
  .put(templatesControllers.updateTemplate)
  .delete(templatesControllers.deleteTemplate);

module.exports = templatesRouter;
