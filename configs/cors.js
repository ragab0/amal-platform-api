const { FRONTEND_URL } = process.env;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-side requests (no origin) TO WORK WITH NEXT.js server-side rendering;
    if (!origin) {
      return callback(null, true);
    }

    if (FRONTEND_URL === origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
};

module.exports = { corsOptions };
