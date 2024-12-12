const mongoose = require("mongoose");

const {
  IS_DB_LOCAL,
  DATABASE_LOCAL,
  DATABASE_REMOTE,
  DATABASE_REMOTE_PASSWORD,
} = process.env;

// configuring the db in both (local && remote) && validate connection or stop the server;
const connectDatabase = async () => {
  let db, options;
  if (IS_DB_LOCAL === "true") {
    db = DATABASE_LOCAL;
    options = {};
  } else {
    db = DATABASE_REMOTE.replace("<db_password>", DATABASE_REMOTE_PASSWORD);
    options = {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    };
  }

  try {
    await mongoose.connect(db, options);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      `Pinged your ${
        IS_DB_LOCAL === "true" ? "local" : "remote"
      } database. You successfully connected to MongoDB!`
    );
  } catch (error) {
    console.error("DB connection is failed:", error);
    process.exit(1); // stop the app;
  }
};

module.exports = connectDatabase;
