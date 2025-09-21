const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  updateProfile,
  updateNotificationPreferences,
  updateExpertiseTags,
  getUserReputation,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/users/current-user
router.get("/current-user", protect, getCurrentUser);

// @route   PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// @route   PUT /api/users/notification-preferences
router.put("/notification-preferences", protect, updateNotificationPreferences);

// @route   PUT /api/users/expertise-tags
router.put("/expertise-tags", protect, updateExpertiseTags);

// @route   GET /api/users/reputation
router.get("/reputation", protect, getUserReputation);

module.exports = router;
