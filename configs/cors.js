const { FRONTEND_URL } = process.env;

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  exposedHeaders: ["set-cookie"],
};

module.exports = { corsOptions };
