const express = require("express");
const {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
} = require("../controllers/answerController");
const { protect } = require("../middleware/authMiddleware");

// Create an Express router instance
const router = express.Router();

// ======================================================================
// Define Answer Routes
// ======================================================================

// POST /api/questions/:questionId/answers - Create a new answer for a specific question (Protected)
// Only authenticated users can post answers.
router.post("/:questionId/answers", protect, createAnswer);

// PUT /api/answers/:id - Update an existing answer (Protected - Only author)
// Only authenticated users who are the author can update answers.
router.put("/:id", protect, updateAnswer);

// DELETE /api/answers/:id - Delete an answer (Protected - Only author)
// Only authenticated users who are the author can delete answers.
router.delete("/:id", protect, deleteAnswer);

// PUT /api/answers/:id/accept - Mark an answer as accepted (Protected - Only question asker)
// Only the authenticated user who asked the question can accept an answer.
router.put("/:id/accept", protect, acceptAnswer);

module.exports = router;
