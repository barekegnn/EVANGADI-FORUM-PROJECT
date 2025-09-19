const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/users/current-user
router.get("/current-user", protect, getCurrentUser);

// @route   PUT /api/users/profile
router.put("/profile", protect, updateProfile);

module.exports = router;
