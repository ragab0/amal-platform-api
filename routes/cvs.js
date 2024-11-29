// const c = require("../controllers/a");
const cvsRouter = require("express").Router();

cvsRouter.route("/").get(c.getAllCVs).post(c.createCV);
cvsRouter.route("/:tempId").get(c.getCV).put(c.updateCV).delete(c.deleteCV);

module.exports = cvsRouter;
