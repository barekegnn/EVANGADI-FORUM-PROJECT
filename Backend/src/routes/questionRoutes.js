const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { createAnswer } = require("../controllers/answerController");
const { protect } = require("../middleware/authMiddleware");

// Create an Express router instance
const router = express.Router();

// GET /api/questions - Retrieve all questions (Public)
router.get("/", getAllQuestions);

// GET /api/questions/:id - Retrieve a single question by ID (Public, but provides user-specific vote if logged in)
router.get("/:id", getQuestionById);

// POST /api/questions - Create a new question (Protected)
router.post("/", protect, createQuestion);

// PUT /api/questions/:id - Update an existing question (Protected - Only author)
router.put("/:id", protect, updateQuestion);

// DELETE /api/questions/:id - Delete a question (Protected - Only author)
router.delete("/:id", protect, deleteQuestion);

// POST /api/questions/:questionId/answers - Create a new answer (Protected)
router.post("/:questionId/answers", protect, createAnswer);

module.exports = router;
