const express = require("express");
const cors = require("cors");

// Import the database connection pool. This will run the connection test on app startup.
const pool = require("./config/database");

const app = express();

// Middleware
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Enable Express to parse JSON body from requests
app.use(express.json());

// A simple test route to confirm the server is running
app.get("/", (req, res) => {
  res.send("Welcome to the Evangadi Q&A Platform Backend!");
});

// We will add more routes here later...

module.exports = app;
