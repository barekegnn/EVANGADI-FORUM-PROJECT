const voteModel = require("../models/voteModel");

// ======================================================================
// Controller to handle voting on a question
// ======================================================================
async function voteOnQuestion(req, res) {
  const { id: questionId } = req.params;
  const { voteType } = req.body; // Expects 1 for upvote, -1 for downvote
  const { id: userId } = req.user; // User ID from the JWT token

  // 1. Validate the voteType
  if (voteType !== 1 && voteType !== -1) {
    return res.status(400).json({
      error: "Invalid vote type. Must be 1 (upvote) or -1 (downvote).",
    });
  }

  try {
    // 2. Call the model function to handle the vote logic
    const result = await voteModel.voteOnQuestion(userId, questionId, voteType);

    res.status(200).json({
      message: "Vote recorded successfully.",
      newVoteType: result.newVoteType,
    });
  } catch (error) {
    console.error("Error voting on question:", error);

    // Handle specific database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "You have already voted on this question.",
        retry: false,
      });
    }

    if (error.code === "ER_LOCK_WAIT_TIMEOUT") {
      return res.status(409).json({
        error: "Server is busy processing votes. Please try again in a moment.",
        retry: true,
      });
    }

    res
      .status(500)
      .json({ error: "Internal server error while voting on question." });
  }
}

// ======================================================================
// Controller to handle voting on an answer
// ======================================================================
async function voteOnAnswer(req, res) {
  const { id: answerId } = req.params;
  const { voteType } = req.body;
  const { id: userId } = req.user;

  // 1. Validate the voteType
  if (voteType !== 1 && voteType !== -1) {
    return res.status(400).json({
      error: "Invalid vote type. Must be 1 (upvote) or -1 (downvote).",
    });
  }

  try {
    // 2. Call the model function to handle the vote logic
    const result = await voteModel.voteOnAnswer(userId, answerId, voteType);

    res.status(200).json({
      message: "Vote recorded successfully.",
      newVoteType: result.newVoteType,
    });
  } catch (error) {
    console.error("Error voting on answer:", error);

    // Handle specific database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "You have already voted on this answer.",
        retry: false,
      });
    }

    if (error.code === "ER_LOCK_WAIT_TIMEOUT") {
      return res.status(409).json({
        error: "Server is busy processing votes. Please try again in a moment.",
        retry: true,
      });
    }

    res
      .status(500)
      .json({ error: "Internal server error while voting on answer." });
  }
}

module.exports = {
  voteOnQuestion,
  voteOnAnswer,
};
