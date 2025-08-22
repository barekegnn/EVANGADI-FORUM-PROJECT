const express = require("express");
const cors = require("cors");

// Import the database connection pool. This will run the connection test on app startup.
const pool = require("./config/database");

// 1. >>> Make sure this line is correct <<<
const authRoutes = require("./routes/authRoutes");
const app = express();

// Middleware
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Enable Express to parse JSON body from requests
app.use(express.json());

// A simple test route to confirm the server is running
app.get("/", (req, res) => {
  res.json("Welcome to the Evangadi Q&A Platform Backend!");
});

// 2. >>> Make sure this line is correct and present <<<
// Mount the authentication routes under the /api/auth path
app.use('/api/auth', authRoutes);

// We will add more routes here later...


module.exports = app;
