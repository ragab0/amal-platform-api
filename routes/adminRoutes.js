const authControllers = require("../controllers/authControllers");
const adminRouter = require("express").Router();
const usersRouter = require("./usersRoutes");
const reviewsRouter = require("./reviewsRoutes");
const jobsRouter = require("./jobsRoutes");

/* protected routes */
adminRouter.use(authControllers.protect, authControllers.assignableTo("admin"));

/* Redirect to feature routers */
adminRouter.use("/users", usersRouter);
adminRouter.use("/jobs", jobsRouter);
adminRouter.use("/reviews", reviewsRouter);

module.exports = adminRouter;
