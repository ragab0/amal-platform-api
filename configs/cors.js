const { FRONTEND_URL } = process.env;

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
};

module.exports = { corsOptions };
