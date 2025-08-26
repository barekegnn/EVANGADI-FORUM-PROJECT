const pool = require("../config/database");

// ======================================================================
// 1. Function to retrieve all available tags from the database.
//    This is used, for example, to display a list of tags when a user is
//    creating a new question or browsing tags.
// ======================================================================
async function getAllTags() {
  // Selects all tag IDs and names from the 'tags' table.
  // Orders them alphabetically by name for easy display.
  const [rows] = await pool.execute(
    "SELECT id, name FROM tags ORDER BY name ASC"
  );
  return rows; // Returns an array of tag objects (e.g., [{ id: 1, name: 'JavaScript' }])
}

// ======================================================================
// 2. Function to associate a list of tags with a specific question.
//    This is called after a question is created or updated, to link it to relevant tags.
// ======================================================================
async function addTagsToQuestion(questionId, tagIds) {
  // Basic check: If no tag IDs are provided, there's nothing to do.
  if (!tagIds || tagIds.length === 0) {
    return;
  }

  // Prepare values for a bulk insert query.
  // We create a string like '(?, ?), (?, ?), ...' for multiple tag associations.
  const values = tagIds.map((tagId) => `(${questionId}, ${tagId})`).join(",");

  // 'INSERT IGNORE' is used here.
  // 'IGNORE' prevents an error if a specific question_id-tag_id pair already exists.
  // Instead of failing, it just skips that duplicate insertion, which is useful
  // when updating tags for a question where some might already be linked.
  await pool.execute(
    `INSERT IGNORE INTO question_tags (question_id, tag_id) VALUES ${values}`
  );
}

// ======================================================================
// 3. Function to retrieve all tags associated with a specific question.
//    This is used when viewing a question's details to show its relevant tags.
// ======================================================================
async function getTagsByQuestionId(questionId) {
  // Joins 'tags' table with 'question_tags' (our junction table)
  // to find all Atag names associated with a given 'questionId'.
  const [rows] = await pool.execute(
    `SELECT t.id, t.name
         FROM tags t
         JOIN question_tags qt ON t.id = qt.tag_id
         WHERE qt.question_id = ?`,
    [questionId]
  );
  return rows;
}

module.exports = {
  getAllTags,
  addTagsToQuestion,
  getTagsByQuestionId,
};
