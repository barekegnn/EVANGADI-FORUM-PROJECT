const pool = require("../config/database");

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
            u.username AS author_username,
            u.profile_picture AS author_profile_picture
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE q.id = ?;
    `;
  const [rows] = await pool.execute(sql, [questionId]);

  if (rows.length === 0) {
    return null;
  }

  const question = rows[0];

  // Get answers for this question
  const answersSql = `
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
  const [answerRows] = await pool.execute(answersSql, [questionId]);

  // Get tags for this question
  const tagsSql = `
    SELECT t.id, t.name, t.description
    FROM tags t
    JOIN question_tags qt ON t.id = qt.tag_id
    WHERE qt.question_id = ?;
  `;
  const [tagRows] = await pool.execute(tagsSql, [questionId]);

  return {
    ...question,
    author_profile_picture: getFullProfilePictureUrl(
      question.author_profile_picture
    ),
    answers: answerRows.map((answer) => ({
      ...answer,
      author_profile_picture: getFullProfilePictureUrl(
        answer.author_profile_picture
      ),
    })),
    tags: tagRows,
  };
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
            u.username AS author_username,
            u.profile_picture AS author_profile_picture,
            (SELECT COUNT(*) FROM answers WHERE question_id = q.id) AS answer_count
        FROM questions q
        JOIN users u ON q.user_id = u.id
        ORDER BY q.created_at DESC;
    `;
  const [rows] = await pool.execute(sql);
  return rows.map((question) => ({
    ...question,
    author_profile_picture: getFullProfilePictureUrl(
      question.author_profile_picture
    ),
  }));
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
