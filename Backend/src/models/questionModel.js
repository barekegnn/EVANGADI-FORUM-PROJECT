const pool = require("../config/database");

// ======================================================================
// 1. Function to create a new question
// ======================================================================
async function createQuestion(userId, title, content) {
  const sql = `
        INSERT INTO questions (user_id, title, content)
        VALUES (?, ?, ?);
    `;
  const [result] = await pool.execute(sql, [userId, title, content]);
  return result.insertId;
}

// ======================================================================
// 2. Function to get a single question by ID
// ======================================================================
async function getQuestionById(questionId) {
  const sql = `
        SELECT
            q.id,
            q.title,
            q.content,
            q.view_count,
            q.vote_count,
            q.created_at,
            u.id AS user_id,
            u.username AS author_username
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE q.id = ?;
    `;
  const [rows] = await pool.execute(sql, [questionId]);
  return rows[0];
}

// ======================================================================
// 3. Function to get all questions
// ======================================================================
async function getAllQuestions() {
  const sql = `
        SELECT
            q.id,
            q.title,
            q.content,
            q.view_count,
            q.vote_count,
            q.created_at,
            u.id AS user_id,
            u.username AS author_username
        FROM questions q
        JOIN users u ON q.user_id = u.id
        ORDER BY q.created_at DESC;
    `;
  const [rows] = await pool.execute(sql);
  return rows;
}

// ======================================================================
// 4. Function to update an existing question
// ======================================================================
async function updateQuestion(questionId, userId, title, content) {
  const sql = `
        UPDATE questions
        SET title = ?, content = ?
        WHERE id = ? AND user_id = ?;
    `;
  const [result] = await pool.execute(sql, [
    title,
    content,
    questionId,
    userId,
  ]);
  return result.affectedRows > 0;
}

// ======================================================================
// 5. Function to delete a question
// ======================================================================
async function deleteQuestion(questionId, userId) {
  const sql = `
        DELETE FROM questions
        WHERE id = ? AND user_id = ?;
    `;
  const [result] = await pool.execute(sql, [questionId, userId]);
  return result.affectedRows > 0;
}

// ======================================================================
// 6. Function to increment view count for a question
// ======================================================================
async function incrementViewCount(questionId) {
  const sql = `
    UPDATE questions 
    SET view_count = view_count + 1 
    WHERE id = ?;
  `;
  await pool.execute(sql, [questionId]);
}

module.exports = {
  createQuestion,
  getQuestionById,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  incrementViewCount,
};
