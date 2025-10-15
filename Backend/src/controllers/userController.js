const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "..", "..", "uploads");
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "profile-" +
        req.user.id +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to construct full profile picture URL
function getFullProfilePictureUrl(profilePicturePath) {
  if (!profilePicturePath) return null;

  // If it's already a full URL, return as is
  if (profilePicturePath.startsWith("http")) {
    return profilePicturePath;
  }

  // Get the base URL from environment variable or default to localhost:5000
  // Since static files are served from the backend, we use the backend URL
  const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}${profilePicturePath}`;
}

// @desc    Get current user's profile
// @route   GET /api/users/current-user
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  // The `req.user` object is attached by the `protect` middleware.
  // It contains the user's ID, username, and email from the database.

  // Get additional user data
  const [
    reputation,
    notificationPreferences,
    expertiseTags,
    questionsCount,
    answersCount,
  ] = await Promise.all([
    userModel.getReputation(req.user.id),
    userModel.getNotificationPreferences(req.user.id),
    userModel.getExpertiseTags(req.user.id),
    userModel.getQuestionsCount(req.user.id),
    userModel.getAnswersCount(req.user.id),
  ]);

  const user = {
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    profilePicture: getFullProfilePictureUrl(req.user.profile_picture),
    bio: req.user.bio,
    phone: req.user.phone,
    telegram: req.user.telegram,
    campus: req.user.campus,
    yearOfStudy: req.user.year_of_study,
    fieldOfStudy: req.user.field_of_study,
    reputation,
    questionsCount,
    answersCount,
    notificationPreferences,
    expertiseTags,
  };

  res.status(200).json(user);
});

// @desc    Get user profile by username
// @route   GET /api/users/username/:username
// @access  Public
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Find user by username
  const user = await userModel.findByUsername(username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Get additional user data
  const [
    reputation,
    notificationPreferences,
    expertiseTags,
    questionsCount,
    answersCount,
  ] = await Promise.all([
    userModel.getReputation(user.id),
    userModel.getNotificationPreferences(user.id),
    userModel.getExpertiseTags(user.id),
    userModel.getQuestionsCount(user.id),
    userModel.getAnswersCount(user.id),
  ]);

  const userData = {
    id: user.id,
    username: user.username,
    email: user.email,
    profilePicture: getFullProfilePictureUrl(user.profile_picture),
    bio: user.bio,
    phone: user.phone,
    telegram: user.telegram,
    campus: user.campus,
    yearOfStudy: user.year_of_study,
    fieldOfStudy: user.field_of_study,
    reputation,
    questionsCount,
    answersCount,
    notificationPreferences,
    expertiseTags,
  };

  res.status(200).json(userData);
});

// @desc    Update a user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // We get the user ID from the `protect` middleware
  const userId = req.user.id;
  const {
    username,
    email,
    bio,
    phone,
    telegram,
    campus,
    yearOfStudy,
    fieldOfStudy,
  } = req.body;

  // Call the model function to update the user in the database
  const updatedUser = await userModel.updateById(userId, {
    username,
    email,
    bio,
    phone,
    location: null,
    telegram,
    campus,
    yearOfStudy,
    fieldOfStudy,
  });

  // If the update was successful, send back the updated user data
  res.status(200).json({
    message: "Profile updated successfully!",
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePicture: getFullProfilePictureUrl(updatedUser.profile_picture),
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      telegram: updatedUser.telegram,
      campus: updatedUser.campus,
      yearOfStudy: updatedUser.year_of_study,
      fieldOfStudy: updatedUser.field_of_study,
    },
  });
});

// @desc    Upload a user's profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  // We get the user ID from the `protect` middleware
  const userId = req.user.id;

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Delete old profile picture if it exists
  const currentUser = await userModel.findById(userId);
  if (currentUser && currentUser.profile_picture) {
    try {
      // Construct the full path to the old file
      const oldFilePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        path.basename(currentUser.profile_picture)
      );
      await fs.unlink(oldFilePath);
    } catch (error) {
      // Ignore errors when deleting old file
      console.log("Could not delete old profile picture:", error.message);
    }
  }

  // Save the new profile picture path in the database
  // The file is saved in the uploads directory, so we store the relative path
  const profilePicturePath = `/uploads/${req.file.filename}`;
  const updatedUser = await userModel.updateProfilePicture(
    userId,
    profilePicturePath
  );

  res.status(200).json({
    message: "Profile picture updated successfully!",
    profilePicture: getFullProfilePictureUrl(updatedUser.profile_picture),
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

// @desc    Get user questions count
// @route   GET /api/users/questions-count
// @access  Private
const getUserQuestionsCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = await userModel.getQuestionsCount(userId);

  res.status(200).json({ count });
});

// @desc    Get user answers count
// @route   GET /api/users/answers-count
// @access  Private
const getUserAnswersCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = await userModel.getAnswersCount(userId);

  res.status(200).json({ count });
});

module.exports = {
  getCurrentUser,
  getUserByUsername,
  updateProfile,
  uploadProfilePicture,
  updateNotificationPreferences,
  updateExpertiseTags,
  getUserReputation,
  getUserQuestionsCount,
  getUserAnswersCount,
  upload,
};
