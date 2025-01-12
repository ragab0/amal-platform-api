const statsRouter = require("express").Router();
const authControllers = require("../controllers/authControllers");
const statsControllers = require("../controllers/statsControllers");

// Protect && asign to admin;
statsRouter.use(authControllers.protect, authControllers.assignableTo("admin"));

statsRouter.route("/").get(statsControllers.getStats);

module.exports = statsRouter;
