const AppError = require("./utils/appError");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./configs/documentation");
const mainErrorController = require("./controllers/handlers/errorHandlers");
const logger = require("./controllers/handlers/logger");
const authRoutes = require("./routes/authRoutes");
const cvsRoutes = require("./routes/cvsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const templatesRoutes = require("./routes/templatesRoutes");
const usersRoutes = require("./routes/usersRoutes");

const app = express();
const { NODE_ENV } = process.env;

app.use(
  cors({
    origin:
      NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:3001"]
        : "https://amal-dev.vercel.app",
    credentials: true,
  })
);
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// mounting the app routes;
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/", authRoutes);
app.use("/api/v1/cvs", cvsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/templates", templatesRoutes);
app.use("/api/v1/users", usersRoutes);

// our main route handler in case a route not matched/handled;
app.all("*", function (req, res, next) {
  next(new AppError(`Not found: (${req.method}) ${req.originalUrl}`, 404));
});

// our main error handler that will catch any error occurs either was operation/none;
app.use(mainErrorController);

module.exports = app;
