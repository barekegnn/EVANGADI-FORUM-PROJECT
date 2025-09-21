const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

// @desc    Get current user's profile
// @route   GET /api/users/current-user
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  // The `req.user` object is attached by the `protect` middleware.
  // It contains the user's ID, username, and email from the database.

  // Get additional user data
  const [reputation, notificationPreferences, expertiseTags] =
    await Promise.all([
      userModel.getReputation(req.user.id),
      userModel.getNotificationPreferences(req.user.id),
      userModel.getExpertiseTags(req.user.id),
    ]);

  const user = {
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    reputation,
    notificationPreferences,
    expertiseTags,
  };

  res.status(200).json(user);
});

// @desc    Update a user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // We get the user ID from the `protect` middleware
  const userId = req.user.id;
  const { username, email } = req.body;

  // Call the model function to update the user in the database
  const updatedUser = await userModel.updateById(userId, { username, email });

  // If the update was successful, send back the updated user data
  res.status(200).json({
    message: "Profile updated successfully!",
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    },
  });
});

// @desc    Update user notification preferences
// @route   PUT /api/users/notification-preferences
// @access  Private
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    return res.status(400).json({ error: "Invalid notification preferences" });
  }

  await userModel.updateNotificationPreferences(userId, preferences);

  res.status(200).json({
    message: "Notification preferences updated successfully!",
    preferences,
  });
});

// @desc    Update user expertise tags
// @route   PUT /api/users/expertise-tags
// @access  Private
const updateExpertiseTags = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { expertiseTags } = req.body;

  if (!Array.isArray(expertiseTags)) {
    return res.status(400).json({ error: "Expertise tags must be an array" });
  }

  await userModel.updateExpertiseTags(userId, expertiseTags);

  res.status(200).json({
    message: "Expertise tags updated successfully!",
    expertiseTags,
  });
});

// @desc    Get user reputation
// @route   GET /api/users/reputation
// @access  Private
const getUserReputation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reputation = await userModel.getReputation(userId);

  res.status(200).json({ reputation });
});

module.exports = {
  getCurrentUser,
  updateProfile,
  updateNotificationPreferences,
  updateExpertiseTags,
  getUserReputation,
};
