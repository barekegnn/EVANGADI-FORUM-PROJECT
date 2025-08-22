// backend/src/routes/authRoutes.js

const express = require("express");
const { register, login, checkUser } = require("../controllers/authController"); // Import controller functions
const { protect } = require("../middleware/authMiddleware"); // <<-- CRITICAL: Import the protection middleware

// Create an Express router instance
const router = express.Router();

// Define routes for authentication
// POST /api/auth/register - Route for user registration
router.post("/register", register);

// POST /api/auth/login - Route for user login
router.post("/login", login);

// GET /api/auth/check - Route to verify if a user's token is valid and they are authenticated
// <<-- CRITICAL: Apply the 'protect' middleware here.
// This means any request to this route will first pass through the 'protect' function.
// If the token is valid, 'protect' calls next(), and 'checkUser' then executes.
// If the token is invalid/missing, 'protect' sends an error, and 'checkUser' is never called.
router.get("/check", protect, checkUser);

// Export the router so it can be used in app.js
module.exports = router;
