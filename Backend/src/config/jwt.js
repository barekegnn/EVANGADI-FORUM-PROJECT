// This file stores the configuration for JSON Web Tokens (JWTs).

// Import dotenv to load environment variables from the .env file.
require("dotenv").config();

// We get it from the .env file for security, falling back to a default if it's missing.
const jwtSecret = process.env.JWT_SECRET || "supersecretkey_fallback";

const jwtExpiration = process.env.JWT_EXPIRATION || "1h";

module.exports = {
  jwtSecret,
  jwtExpiration,
};
