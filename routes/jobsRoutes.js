const jobsControllers = require("../controllers/jobsControllers");
const jobsRouter = require("express").Router();
const authControllers = require("../controllers/authControllers");

/* Public routes */
jobsRouter.get("/public", jobsControllers.getAllJobs);
jobsRouter.get("/public/:jobId", jobsControllers.getJob);

/* Protected routes Admin routes (Router-Level) */
jobsRouter.use(authControllers.protect, authControllers.assignableTo("admin"));

jobsRouter
  .route("/")
  .get(jobsControllers.getAllJobsAdmin)
  .post(jobsControllers.createJob);
jobsRouter
  .route("/:jobId")
  .get(jobsControllers.getJobAdmin)
  .put(jobsControllers.updateJob)
  .delete(jobsControllers.deleteJob);

module.exports = jobsRouter;
