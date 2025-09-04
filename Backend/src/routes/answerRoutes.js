// backend/src/routes/answerRoutes.js

const express = require("express");
const {
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
} = require("../controllers/answerController"); // Import answer controller functions
const { protect } = require("../middleware/authMiddleware"); // Import the protection middleware

// Create an Express router instance
const router = express.Router();

// ======================================================================
// Define Answer Routes (only for actions on a specific answer by its ID)
// ======================================================================

// PUT /api/answers/:id - Update an existing answer (Protected - Only author)
// Only authenticated users who are the author can update answers.
router.put("/:id", protect, updateAnswer);

// DELETE /api/answers/:id - Delete an answer (Protected - Only author)
// Only authenticated users who are the author can delete answers.
router.delete("/:id", protect, deleteAnswer);

// PUT /api/answers/:id/accept - Mark an answer as accepted (Protected - Only question asker)
// Only the authenticated user who asked the question can accept an answer.
router.put("/:id/accept", protect, acceptAnswer);

// Export the router
module.exports = router;
