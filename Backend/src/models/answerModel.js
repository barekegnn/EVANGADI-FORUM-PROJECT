const pool = require("../config/database");
const userModel = require("./userModel");

// Helper function to construct full profile picture URL
function getFullProfilePictureUrl(profilePicturePath) {
  if (!profilePicturePath) return null;

  // If it's already a full URL, return as is
  if (profilePicturePath.startsWith("http")) {
    return profilePicturePath;
  }

  // Get the base URL from environment variable or default to localhost:5000
  // Since static files are served from the backend, we use the backend URL
  const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}${profilePicturePath}`;
}

// ======================================================================
// 1. Function to create a new answer
// ======================================================================
async function createAnswer(questionId, userId, content) {
  const sql = `
        INSERT INTO answers (question_id, user_id, content)
        VALUES (?, ?, ?);
    `;
  const [result] = await pool.execute(sql, [questionId, userId, content]);
  return result.insertId;
}

// ======================================================================
// 2. Function to get all answers for a specific question
// ======================================================================
async function getAnswersByQuestionId(questionId) {
  const sql = `
        SELECT
            a.id AS answer_id,
            a.content,
            a.is_accepted_answer,
            a.created_at,
            u.id AS user_id,
            u.username,
            u.profile_picture AS author_profile_picture,
            a.vote_count AS votes
        FROM answers a
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = ?
        ORDER BY a.is_accepted_answer DESC, a.created_at DESC;
    `;
  const [rows] = await pool.execute(sql, [questionId]);
  return rows.map((answer) => ({
    ...answer,
    author_profile_picture: getFullProfilePictureUrl(
      answer.author_profile_picture
    ),
  }));
}

// ======================================================================
// 3. Function to update an existing answer
// ======================================================================
async function updateAnswer(answerId, userId, content) {
  const sql = `
        UPDATE answers
        SET content = ?
        WHERE id = ? AND user_id = ?;
    `;
  const [result] = await pool.execute(sql, [content, answerId, userId]);
  return result.affectedRows > 0;
}

// ======================================================================
// 4. Function to delete an existing answer
// ======================================================================
async function deleteAnswer(answerId, userId) {
  const sql = `
        DELETE FROM answers
        WHERE id = ? AND user_id = ?;
    `;
  const [result] = await pool.execute(sql, [answerId, userId]);
  return result.affectedRows > 0;
}

// ======================================================================
// 5. Function to get a single answer by its ID
// ======================================================================
async function getAnswerById(answerId) {
  const sql = `
        SELECT *
        FROM answers
        WHERE id = ?;
    `;
  const [rows] = await pool.execute(sql, [answerId]);
  return rows[0];
}

// ======================================================================
// 6. Function to set an answer as the accepted solution
// ======================================================================
async function setAcceptedAnswer(answerId, questionId, userId) {
  // Start a database transaction to ensure atomicity
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step 1: Verify the user is the original asker of the question.
    const [questionRows] = await connection.execute(
      "SELECT user_id FROM questions WHERE id = ?",
      [questionId]
    );
    if (questionRows.length === 0 || questionRows[0].user_id !== userId) {
      throw new Error(
        "Unauthorized: Only the question asker can accept an answer."
      );
    }

    // Step 2: Unset any previously accepted answer for this question.
    // There can only be one accepted answer per question.
    const [unsetResult] = await connection.execute(
      "UPDATE answers SET is_accepted_answer = 0 WHERE question_id = ?",
      [questionId]
    );

    // Step 3: Set the new answer as the accepted one.
    const [setResult] = await connection.execute(
      "UPDATE answers SET is_accepted_answer = 1 WHERE id = ? AND question_id = ?",
      [answerId, questionId]
    );

    // Step 4: Check if the update was successful.
    if (setResult.affectedRows === 0) {
      throw new Error(
        "Failed to update the answer. Answer may not exist for this question."
      );
    }

    // Step 5: Award reputation bonus to the answer author
    const [answerRows] = await connection.execute(
      "SELECT user_id FROM answers WHERE id = ?",
      [answerId]
    );
    if (answerRows.length > 0) {
      const answerAuthorId = answerRows[0].user_id;
      await userModel.updateReputation(answerAuthorId, 10); // +10 reputation for accepted answer
    }

    // Commit the transaction if all steps were successful.
    await connection.commit();
    return true;
  } catch (error) {
    // Rollback the transaction in case of an error.
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createAnswer,
  getAnswersByQuestionId,
  updateAnswer,
  deleteAnswer,
  getAnswerById,
  setAcceptedAnswer,
};
