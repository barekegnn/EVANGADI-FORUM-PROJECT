const pool = require("../config/database");

// ======================================================================
// 1. Function to record or update a vote on a question.
//    This function handles both adding a new vote and changing an existing vote.
// ======================================================================
async function recordQuestionVote(userId, questionId, voteType) {
  // 'voteType' will be 1 for upvote, -1 for downvote.

  // Get a dedicated connection for a transaction to ensure atomicity.
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // Start a transaction.

    // Step 1: Check if the user has already voted on this question.
    const [existingVote] = await connection.execute(
      "SELECT vote_type FROM votes WHERE user_id = ? AND question_id = ? AND answer_id IS NULL",
      [userId, questionId]
    );

    let voteChanged = false; // Flag to indicate if a vote was changed (not just added)

    if (existingVote.length > 0) {
      // User has an existing vote.
      const oldVoteType = existingVote[0].vote_type;

      if (oldVoteType === voteType) {
        // If the new vote is the same as the old one, it means the user wants to remove their vote.
        await connection.execute(
          "DELETE FROM votes WHERE user_id = ? AND question_id = ? AND answer_id IS NULL",
          [userId, questionId]
        );
        // Also decrement the score from the question
        await connection.execute(
          "UPDATE questions SET score = score - ? WHERE id = ?",
          [oldVoteType, questionId]
        );
        voteChanged = true; // Vote was "changed" to removed
      } else {
        // User is changing their vote (e.g., upvote to downvote, or vice-versa).
        await connection.execute(
          "UPDATE votes SET vote_type = ? WHERE user_id = ? AND question_id = ? AND answer_id IS NULL",
          [voteType, userId, questionId]
        );
        // Adjust question score: subtract old vote and add new vote.
        await connection.execute(
          "UPDATE questions SET score = score - ? + ? WHERE id = ?",
          [oldVoteType, voteType, questionId]
        );
        voteChanged = true; // Vote was changed
      }
    } else {
      // User is casting a new vote.
      await connection.execute(
        "INSERT INTO votes (user_id, question_id, vote_type) VALUES (?, ?, ?)",
        [userId, questionId, voteType]
      );
      // Increment the question's score.
      await connection.execute(
        "UPDATE questions SET score = score + ? WHERE id = ?",
        [voteType, questionId]
      );
    }

    await connection.commit(); // Commit the transaction if all steps succeed.
    return true; // Indicate success.
  } catch (error) {
    await connection.rollback(); // Rollback changes if any error occurs.
    throw error; // Re-throw the error for the controller to handle.
  } finally {
    connection.release(); // Always release the connection back to the pool.
  }
}

// ======================================================================
// 2. Function to record or update a vote on an answer.
//    Similar logic to question votes but for answers.
// ======================================================================
async function recordAnswerVote(userId, answerId, voteType) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingVote] = await connection.execute(
      "SELECT vote_type FROM votes WHERE user_id = ? AND answer_id = ? AND question_id IS NULL",
      [userId, answerId]
    );

    let voteChanged = false;

    if (existingVote.length > 0) {
      const oldVoteType = existingVote[0].vote_type;

      if (oldVoteType === voteType) {
        // Remove vote
        await connection.execute(
          "DELETE FROM votes WHERE user_id = ? AND answer_id = ? AND question_id IS NULL",
          [userId, answerId]
        );
        await connection.execute(
          "UPDATE answers SET score = score - ? WHERE id = ?",
          [oldVoteType, answerId]
        );
        voteChanged = true;
      } else {
        // Change vote
        await connection.execute(
          "UPDATE votes SET vote_type = ? WHERE user_id = ? AND answer_id = ? AND question_id IS NULL",
          [voteType, userId, answerId]
        );
        await connection.execute(
          "UPDATE answers SET score = score - ? + ? WHERE id = ?",
          [oldVoteType, voteType, answerId]
        );
        voteChanged = true;
      }
    } else {
      // New vote
      await connection.execute(
        "INSERT INTO votes (user_id, answer_id, vote_type) VALUES (?, ?, ?)",
        [userId, answerId, voteType]
      );
      await connection.execute(
        "UPDATE answers SET score = score + ? WHERE id = ?",
        [voteType, answerId]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ======================================================================
// 3. Function to get a user's vote on a specific question (if any).
// ======================================================================
async function getUserVoteForQuestion(userId, questionId) {
  const [rows] = await pool.execute(
    "SELECT vote_type FROM votes WHERE user_id = ? AND question_id = ? AND answer_id IS NULL",
    [userId, questionId]
  );
  return rows.length > 0 ? rows[0].vote_type : 0; // Returns 1, -1, or 0 if no vote
}

// ======================================================================
// 4. Function to get a user's vote on a specific answer (if any).
// ======================================================================
async function getUserVoteForAnswer(userId, answerId) {
  const [rows] = await pool.execute(
    "SELECT vote_type FROM votes WHERE user_id = ? AND answer_id = ? AND question_id IS NULL",
    [userId, answerId]
  );
  return rows.length > 0 ? rows[0].vote_type : 0; // Returns 1, -1, or 0 if no vote
}

module.exports = {
  recordQuestionVote,
  recordAnswerVote,
  getUserVoteForQuestion,
  getUserVoteForAnswer,
};
