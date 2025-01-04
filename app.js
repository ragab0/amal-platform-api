const AppError = require("./utils/appError");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
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
const chatRoutes = require("./routes/chatRoutes");
const { corsOptions } = require("./configs/cors");
const { apiLimiter } = require("./configs/limiter");

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(cors(corsOptions));
app.use(logger);
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
app.use(compression());

// mounting the app routes;
app.use("/", apiLimiter);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/ai/", aiRoutes);
app.use("/api/v1/cvs", cvsRoutes);
app.use("/api/v1/templates", templatesRoutes);
app.use("/api/v1/admin/", adminRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/chat", chatRoutes);

// our main route handler in case a route not matched/handled;
app.all("*", function (req, res, next) {
  next(new AppError(`Not found: (${req.method}) ${req.originalUrl}`, 404));
});

// our main error handler that will catch any error occurs either was operation/none;
app.use(mainErrorController);

module.exports = app;
