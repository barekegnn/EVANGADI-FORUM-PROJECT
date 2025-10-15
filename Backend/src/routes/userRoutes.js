const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  getUserByUsername, // Add this line
  updateProfile,
  uploadProfilePicture,
  updateNotificationPreferences,
  updateExpertiseTags,
  getUserReputation,
  getUserQuestionsCount,
  getUserAnswersCount,
  upload,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/users/current-user
router.get("/current-user", protect, getCurrentUser);

// @route   GET /api/users/username/:username
router.get("/username/:username", getUserByUsername); // Add this line

// @route   PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// @route   POST /api/users/profile-picture
router.post(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// @route   PUT /api/users/notification-preferences
router.put("/notification-preferences", protect, updateNotificationPreferences);

// @route   PUT /api/users/expertise-tags
router.put("/expertise-tags", protect, updateExpertiseTags);

// @route   GET /api/users/reputation
router.get("/reputation", protect, getUserReputation);

// @route   GET /api/users/questions-count
router.get("/questions-count", protect, getUserQuestionsCount);

// @route   GET /api/users/answers-count
router.get("/answers-count", protect, getUserAnswersCount);

module.exports = router;
