const AppError = require("./utils/appError");
const express = require("express");
// const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./configs/documentation");
const passport = require("./configs/passport");
const sessionConfig = require("./configs/session");
const mainErrorController = require("./controllers/handlers/errorHandlers");
const logger = require("./controllers/handlers/logger");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cvsRoutes = require("./routes/cvsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const templatesRoutes = require("./routes/templatesRoutes");
const usersRoutes = require("./routes/usersRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { corsOptions } = require("./configs/cors");

const app = express();
app.use(cors(corsOptions));
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
app.use(compression());

// mounting the app routes;
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/ai/", aiRoutes);
app.use("/api/v1/cvs", cvsRoutes);
app.use("/api/v1/templates", templatesRoutes);
app.use("/api/v1/admin/", adminRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);

// our main route handler in case a route not matched/handled;
app.all("*", function (req, res, next) {
  next(new AppError(`Not found: (${req.method}) ${req.originalUrl}`, 404));
});

// our main error handler that will catch any error occurs either was operation/none;
app.use(mainErrorController);

module.exports = app;
