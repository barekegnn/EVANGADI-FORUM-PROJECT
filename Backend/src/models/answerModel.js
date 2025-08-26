// Import the database connection pool. This connects us to our MySQL database.
const pool = require("../config/database");

// ======================================================================
// 1. Function to create a new answer for a specific question.
//    This is called when a user submits an answer to an existing question.
// ======================================================================
async function createAnswer(questionId, userId, content) {
  // We use a prepared statement to securely insert the answer's details.
  // 'question_id', 'user_id', and 'content' are the columns we're filling.
  const [result] = await pool.execute(
    "INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)",
    [questionId, userId, content] // The values for the placeholders.
  );
  // 'result.insertId' will contain the unique ID that MySQL assigned to this new answer.
  return result.insertId;
}

// ======================================================================
// 2. Function to retrieve all answers for a given question ID.
//    This is used when a user views a specific question's page and needs to see all replies.
// ======================================================================
async function getAnswersByQuestionId(questionId) {
  // This SQL query fetches all answers linked to a specific 'questionId'.
  // It also JOINS with the 'users' table to pull in the 'username' of each answer's author.
  // ORDER BY clause:
  //   - 'is_accepted_answer DESC': This puts answers marked as TRUE (accepted) at the very top.
  //   - 'created_at ASC': For answers that are not accepted (or all accepted answers if there were multiple, though usually only one),
  //     it sorts them by their creation date, with the oldest answers appearing first.
  const [rows] = await pool.execute(
    `SELECT a.id, a.content, a.created_at, a.updated_at, a.is_accepted_answer,
                u.username AS author_username, u.id AS author_id
         FROM answers a
         JOIN users u ON a.user_id = u.id
         WHERE a.question_id = ?
         ORDER BY a.is_accepted_answer DESC, a.created_at ASC`,
    [questionId]
  );
  return rows; // Returns an array of answer objects.
}

// ======================================================================
// 3. Function to update an existing answer.
//    Allows the original author to edit their answer.
// ======================================================================
async function updateAnswer(id, userId, content) {
  // The 'WHERE id = ? AND user_id = ?' part is crucial for security and authorization:
  // It ensures that *only* the answer with the given 'id' AND that belongs to the 'userId'
  // attempting the update will be modified.
  const [result] = await pool.execute(
    "UPDATE answers SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [content, id, userId]
  );
  // 'result.affectedRows' tells us how many rows were successfully updated.
  // If it's > 0, it means the answer was found and updated by its owner.
  // If 0, either the answer ID was wrong, or the 'userId' didn't match the original author.
  return result.affectedRows > 0;
}

// ======================================================================
// 4. Function to delete an answer.
//    Allows the original author to remove their answer.
// ======================================================================
async function deleteAnswer(id, userId) {
  // Deletes an answer from the 'answers' table.
  // Similar to update, 'WHERE id = ? AND user_id = ?' prevents unauthorized deletion.
  const [result] = await pool.execute(
    "DELETE FROM answers WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  // Returns true if an answer was successfully deleted by its owner.
  return result.affectedRows > 0;
}

// ======================================================================
// 5. Function to set an answer as the accepted answer for its question.
//    This is a more complex operation because it ensures only ONE answer can be accepted
//    per question, and only the question's asker can perform this.
// ======================================================================
async function setAcceptedAnswer(answerId, questionId, userIdOfQuestionAsker) {
  // We get a dedicated 'connection' from the pool. This is important for transactions.
  // A transaction ensures that *all* database operations within it either succeed together
  // or fail together (rollback), preventing inconsistent data.
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction(); // Start the transaction.

    // Step 1: Verify the user trying to accept the answer is actually the one who asked the question.
    const [questionRows] = await connection.execute(
      "SELECT id FROM questions WHERE id = ? AND user_id = ?",
      [questionId, userIdOfQuestionAsker]
    );

    if (questionRows.length === 0) {
      // If the user ID doesn't match the question's author, throw an error.
      // This error will be caught by the 'catch' block, and the transaction will roll back.
      throw new Error(
        "Unauthorized: Only the question asker can accept an answer."
      );
    }

    // Step 2: Unset any previously accepted answer for this specific question.
    // This ensures that only one answer can be marked as accepted at a time for a given question.
    await connection.execute(
      "UPDATE answers SET is_accepted_answer = FALSE WHERE question_id = ?",
      [questionId]
    );

    // Step 3: Set the specified answer as the accepted answer.
    const [result] = await connection.execute(
      "UPDATE answers SET is_accepted_answer = TRUE WHERE id = ? AND question_id = ?",
      [answerId, questionId]
    );

    await connection.commit(); // If all steps above completed without error, commit the changes to the database.
    // Returns true if the acceptance was successful.
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback(); // If any error occurred, undo all changes made during the transaction.
    throw error; // Re-throw the error so the calling controller can handle it.
  } finally {
    // ALWAYS release the connection back to the pool, whether the transaction succeeded or failed.
    // This is crucial for preventing connection leaks.
    connection.release();
  }
}

module.exports = {
  createAnswer,
  getAnswersByQuestionId,
  updateAnswer,
  deleteAnswer,
  setAcceptedAnswer,
};
