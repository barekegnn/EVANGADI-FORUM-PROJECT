// Import the database connection pool. This gives us access to our MySQL database.
const pool = require("../config/database");

// ======================================================================
// 1. Function to create a new question in the database
//    This function is called when a user wants to post a new question.
// ======================================================================
async function createQuestion(userId, title, content) {
  // Uses a prepared statement (with ?) to securely insert data into the 'questions' table.
  const [result] = await pool.execute(
    "INSERT INTO questions (user_id, title, content) VALUES (?, ?, ?)",
    [userId, title, content] // The values for the placeholders in the SQL query.
  );
  // 'result.insertId' contains the auto-generated ID of the newly created question.
  // This ID is crucial for linking answers, tags, and votes to this question.
  return result.insertId;
}

// ======================================================================
// 2. Function to retrieve all questions from the database
//    This is used, for example, on the homepage to display a list of all questions.
// ======================================================================
async function getAllQuestions() {
  // Joins 'questions' table with 'users' table to get the author's username for each question.
  // Orders questions by 'created_at' in descending order (newest questions first).
  const [rows] = await pool.execute(
    `SELECT q.id, q.title, q.content, q.created_at, q.updated_at, q.view_count,
                u.username AS author_username, u.id AS author_id
         FROM questions q
         JOIN users u ON q.user_id = u.id
         ORDER BY q.created_at DESC`
  );
  // Returns an array of question objects, each including the author's details.
  return rows;
}

// ======================================================================
// 3. Function to retrieve a single question by its ID
//    This is used when a user clicks on a question to see its details.
// ======================================================================
async function getQuestionById(id) {
  // First, increment the 'view_count' for this specific question.
  // This happens every time the question's details are fetched.
  await pool.execute(
    "UPDATE questions SET view_count = view_count + 1 WHERE id = ?",
    [id]
  );

  // Then, fetch the question's details, including the author's username.
  const [rows] = await pool.execute(
    `SELECT q.id, q.title, q.content, q.created_at, q.updated_at, q.view_count,
                u.username AS author_username, u.id AS author_id
         FROM questions q
         JOIN users u ON q.user_id = u.id
         WHERE q.id = ?`,
    [id]
  );
  // Returns the first (and typically only) row found, which is the question object.
  // If no question is found with that ID, it returns undefined.
  return rows[0];
}

// ======================================================================
// 4. Function to update an existing question
//    This allows the original author to edit their question.
// ======================================================================
async function updateQuestion(id, userId, title, content) {
  // Updates the 'title' and 'content' of a question.
  // The `user_id = ?` condition is crucial for authorization: only the original author
  // (whose ID matches 'userId') can update their question.
  const [result] = await pool.execute(
    "UPDATE questions SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [title, content, id, userId]
  );
  // 'result.affectedRows' indicates how many rows were updated.
  // If it's greater than 0, the update was successful.
  return result.affectedRows > 0;
}

// ======================================================================
// 5. Function to delete a question
//    This allows the original author to remove their question.
// ======================================================================
async function deleteQuestion(id, userId) {
  // Deletes a question from the 'questions' table.
  // Similar to update, `user_id = ?` ensures only the original author can delete.
  const [result] = await pool.execute(
    "DELETE FROM questions WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  // Returns true if a row was deleted.
  return result.affectedRows > 0;
}

// Export all these functions so they can be imported and used by controllers.
module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
