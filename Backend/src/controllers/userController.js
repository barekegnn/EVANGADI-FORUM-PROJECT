// backend/src/controllers/userController.js

const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

// @desc    Get current user's profile
// @route   GET /api/users/current-user
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  // The `req.user` object is attached by the `protect` middleware.
  // It contains the user's ID, username, and email from the database.
  const user = {
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
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

module.exports = {
  getCurrentUser,
  updateProfile,
};
