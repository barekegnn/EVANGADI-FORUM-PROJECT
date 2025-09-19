const express = require("express");
const {
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
} = require("../controllers/answerController");
const { protect } = require("../middleware/authMiddleware");

// Create an Express router instance
const router = express.Router();

// PUT /api/answers/:id - Update an existing answer (Protected - Only author)
router.put("/:id", protect, updateAnswer);

// DELETE /api/answers/:id - Delete an answer (Protected - Only author)
router.delete("/:id", protect, deleteAnswer);

// PUT /api/answers/:id/accept - Mark an answer as accepted (Protected - Only question asker)
router.put("/:id/accept", protect, acceptAnswer);


module.exports = router;
