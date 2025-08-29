const express = require("express");
const cors = require("cors");

// Import the database connection pool (this will run the connection test on app startup)
const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");

const questionRoutes = require("./routes/questionRoutes");

const answerRoutes = require("./routes/answerRoutes");

const app = express();

// Middleware
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Enable Express to parse JSON body from requests
app.use(express.json());

// A simple test route to confirm the server is running
app.get("/", (req, res) => {
  res.send("Welcome to the Haramaya University Students Q&A Platform Backend!");
});

// ======================================================================
// Mount the API Routes
// ======================================================================
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);

// >>> NEW: Mount the answer routes under the /api/answers path <<<
// Note: Some answer routes will use /api/questions/:questionId/answers as their base.
// This /api/answers route is for operations directly on an answer by its ID.
app.use("/api/answers", answerRoutes);

// Error handling middleware (optional, but good practice for full apps)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
