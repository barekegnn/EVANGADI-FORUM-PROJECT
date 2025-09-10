// backend/src/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

/**
 * This file defines all the protected, user-specific API endpoints.
 * All routes here require a valid authentication token.
 */

// @route   GET /api/users/current-user
// @desc    Get the currently authenticated user's profile
// @access  Private
router.get("/current-user", protect, getCurrentUser);

// @route   PUT /api/users/profile
// @desc    Update a user's profile information
// @access  Private
router.put("/profile", protect, updateProfile);

module.exports = router;
