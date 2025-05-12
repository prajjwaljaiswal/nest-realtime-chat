/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config(); // Load .env file

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTOR,
  },
  // Add test and production configurations if needed
};
