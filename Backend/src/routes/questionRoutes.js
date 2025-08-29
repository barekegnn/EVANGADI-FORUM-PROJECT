const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { protect } = require("../middleware/authMiddleware");

// Create an Express router instance
const router = express.Router();

// ======================================================================
// Define Question Routes
// ======================================================================

// GET /api/questions - Retrieve all questions (Public)
router.get("/", getAllQuestions);

// GET /api/questions/:id - Retrieve a single question by ID (Public, but provides user-specific vote if logged in)
// Note: 'protect' is NOT applied here. req.user will be undefined if not logged in.
// The controller 'getQuestionById' handles checking req.user.id internally.
router.get("/:id", getQuestionById);

// POST /api/questions - Create a new question (Protected)
// Only authenticated users can create questions.
router.post("/", protect, createQuestion);

// PUT /api/questions/:id - Update an existing question (Protected - Only author)
// Only authenticated users who are the author can update questions.
router.put("/:id", protect, updateQuestion);

// DELETE /api/questions/:id - Delete a question (Protected - Only author)
// Only authenticated users who are the author can delete questions.
router.delete("/:id", protect, deleteQuestion);


module.exports = router;
