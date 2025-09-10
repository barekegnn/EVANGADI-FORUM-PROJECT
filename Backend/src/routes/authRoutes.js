const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Define all authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

// Export the router
module.exports = router;
