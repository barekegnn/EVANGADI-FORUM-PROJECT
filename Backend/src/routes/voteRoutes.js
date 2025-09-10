const express = require("express");
const {
  voteOnQuestion,
  voteOnAnswer,
} = require("../controllers/voteController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================================
// Define Vote Routes (all are protected)
// ======================================================================

// POST /api/votes/questions/:id - Upvote or downvote a question
router.post("/questions/:id", protect, voteOnQuestion);

// POST /api/votes/answers/:id - Upvote or downvote an answer
router.post("/answers/:id", protect, voteOnAnswer);

module.exports = router;
