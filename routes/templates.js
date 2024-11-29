// const c = require("../controllers/a");
const templatesRouter = require("express").Router();

templatesRouter.route("/").get(c.getAllTemplates).post(c.createTemplate);
templatesRouter
  .route("/:tempId")
  .get(c.getTemplate)
  .put(c.updateTemplate)
  .delete(c.deleteTemplate);

module.exports = templatesRouter;
