const pool = require("../config/database");
const userModel = require("./userModel");

// ======================================================================
// 1. Function to get a user's vote on a specific question
// ======================================================================
async function getUserVoteForQuestion(userId, questionId) {
  const sql = `
        SELECT vote_type
        FROM question_votes
        WHERE user_id = ? AND question_id = ?;
    `;
  const [rows] = await pool.execute(sql, [userId, questionId]);

  // Return the vote type (1 for upvote, -1 for downvote) or 0 if no vote exists
  return rows.length > 0 ? rows[0].vote_type : 0;
}

// ======================================================================
// 2. Function to get a user's vote on a specific answer
// ======================================================================
async function getUserVoteForAnswer(userId, answerId) {
  const sql = `
        SELECT vote_type
        FROM answer_votes
        WHERE user_id = ? AND answer_id = ?;
    `;
  const [rows] = await pool.execute(sql, [userId, answerId]);

  // Return the vote type (1 for upvote, -1 for downvote) or 0 if no vote exists
  return rows.length > 0 ? rows[0].vote_type : 0;
}

// ======================================================================
// Function to get vote status for multiple questions
// ======================================================================
async function getUserVotesForQuestions(userId, questionIds) {
  if (!questionIds || questionIds.length === 0) return {};

  const placeholders = questionIds.map(() => "?").join(",");
  const sql = `
    SELECT question_id, vote_type
    FROM question_votes
    WHERE user_id = ? AND question_id IN (${placeholders});
  `;

  const [rows] = await pool.execute(sql, [userId, ...questionIds]);

  const votes = {};
  rows.forEach((row) => {
    votes[row.question_id] = row.vote_type;
  });

  return votes;
}

// ======================================================================
// Function to get vote status for multiple answers
// ======================================================================
async function getUserVotesForAnswers(userId, answerIds) {
  if (!answerIds || answerIds.length === 0) return {};

  const placeholders = answerIds.map(() => "?").join(",");
  const sql = `
    SELECT answer_id, vote_type
    FROM answer_votes
    WHERE user_id = ? AND answer_id IN (${placeholders});
  `;

  const [rows] = await pool.execute(sql, [userId, ...answerIds]);

  const votes = {};
  rows.forEach((row) => {
    votes[row.answer_id] = row.vote_type;
  });

  return votes;
}

// ======================================================================
// 3. Function to update or create a vote on a question
// ======================================================================
async function voteOnQuestion(userId, questionId, voteType) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the user has already voted on this question
    const [existingVoteRows] = await connection.execute(
      "SELECT id, vote_type FROM question_votes WHERE user_id = ? AND question_id = ?",
      [userId, questionId]
    );

    let voteChange = 0;
    let finalVoteType = voteType;

    if (existingVoteRows.length > 0) {
      const existingVote = existingVoteRows[0];
      if (existingVote.vote_type === voteType) {
        // User is voting the same way again, so remove their vote
        await connection.execute("DELETE FROM question_votes WHERE id = ?", [
          existingVote.id,
        ]);
        voteChange = -voteType; // Adjust the vote count by the opposite value
        finalVoteType = 0; // No vote
      } else {
        // User is changing their vote (e.g., from upvote to downvote)
        await connection.execute(
          "UPDATE question_votes SET vote_type = ? WHERE id = ?",
          [voteType, existingVote.id]
        );
        voteChange = voteType - existingVote.vote_type;
      }
    } else {
      // User is casting a new vote
      // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
      const [result] = await connection.execute(
        "INSERT INTO question_votes (user_id, question_id, vote_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE vote_type = ?",
        [userId, questionId, voteType, voteType]
      );
      voteChange = voteType;
    }

    // Update the vote_count on the questions table
    await connection.execute(
      "UPDATE questions SET vote_count = vote_count + ? WHERE id = ?",
      [voteChange, questionId]
    );

    // Update reputation for the question author (if vote change occurred)
    if (voteChange !== 0) {
      const [questionRows] = await connection.execute(
        "SELECT user_id FROM questions WHERE id = ?",
        [questionId]
      );
      if (questionRows.length > 0) {
        const questionAuthorId = questionRows[0].user_id;
        const reputationChange = voteChange * 2; // +2 for upvote, -2 for downvote
        await userModel.updateReputation(questionAuthorId, reputationChange);
      }
    }

    await connection.commit();
    return { success: true, newVoteType: finalVoteType };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ======================================================================
// 4. Function to update or create a vote on an answer
// ======================================================================
async function voteOnAnswer(userId, answerId, voteType) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingVoteRows] = await connection.execute(
      "SELECT id, vote_type FROM answer_votes WHERE user_id = ? AND answer_id = ?",
      [userId, answerId]
    );

    let voteChange = 0;
    let finalVoteType = voteType;

    if (existingVoteRows.length > 0) {
      const existingVote = existingVoteRows[0];
      if (existingVote.vote_type === voteType) {
        await connection.execute("DELETE FROM answer_votes WHERE id = ?", [
          existingVote.id,
        ]);
        voteChange = -voteType;
        finalVoteType = 0;
      } else {
        await connection.execute(
          "UPDATE answer_votes SET vote_type = ? WHERE id = ?",
          [voteType, existingVote.id]
        );
        voteChange = voteType - existingVote.vote_type;
      }
    } else {
      // User is casting a new vote
      // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
      const [result] = await connection.execute(
        "INSERT INTO answer_votes (user_id, answer_id, vote_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE vote_type = ?",
        [userId, answerId, voteType, voteType]
      );
      voteChange = voteType;
    }

    await connection.execute(
      "UPDATE answers SET vote_count = vote_count + ? WHERE id = ?",
      [voteChange, answerId]
    );

    // Update reputation for the answer author (if vote change occurred)
    if (voteChange !== 0) {
      const [answerRows] = await connection.execute(
        "SELECT user_id FROM answers WHERE id = ?",
        [answerId]
      );
      if (answerRows.length > 0) {
        const answerAuthorId = answerRows[0].user_id;
        const reputationChange = voteChange * 3; // +3 for upvote, -3 for downvote (answers worth more)
        await userModel.updateReputation(answerAuthorId, reputationChange);
      }
    }

    await connection.commit();
    return { success: true, newVoteType: finalVoteType };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getUserVoteForQuestion,
  getUserVoteForAnswer,
  getUserVotesForQuestions,
  getUserVotesForAnswers,
  voteOnQuestion,
  voteOnAnswer,
};
