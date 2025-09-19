const pool = require("../config/database");

// 1.Function to find an array of tags by name, creating them if they don't exist.
async function createOrFindTags(tagNames) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const tagIds = [];
    for (const tagName of tagNames) {
      const normalizedName = tagName.trim().toLowerCase();
      if (!normalizedName) continue;

      const [existingRows] = await connection.execute(
        "SELECT id FROM tags WHERE name = ?",
        [normalizedName]
      );

      if (existingRows.length > 0) {
        tagIds.push(existingRows[0].id);
      } else {
        const [result] = await connection.execute(
          "INSERT INTO tags (name) VALUES (?)",
          [normalizedName]
        );
        tagIds.push(result.insertId);
      }
    }
    await connection.commit();
    return tagIds;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 2. Function to add tags to a question (associating them in the junction table).
async function addTagsToQuestion(questionId, tagIds) {
  if (!tagIds || tagIds.length === 0) {
    return;
  }
  const values = tagIds.map((tagId) => [questionId, tagId]);
  try {
    await pool.query(
      "INSERT IGNORE INTO question_tags (question_id, tag_id) VALUES ?",
      [values]
    );
    return true;
  } catch (error) {
    throw error;
  }
}

// 3. Function to get all tags for a specific question.
async function getTagsByQuestionId(questionId) {
  try {
    const [rows] = await pool.execute(
      `SELECT t.id, t.name
             FROM tags t
             JOIN question_tags qt ON t.id = qt.tag_id
             WHERE qt.question_id = ?`,
      [questionId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

// 4. Function to get all existing tags from the database.
async function getAllTags() {
  try {
    const [rows] = await pool.execute("SELECT id, name FROM tags");
    return rows;
  } catch (error) {
    throw error;
  }
}

// 5. NEW FUNCTION: Remove all tag associations for a specific question.
async function removeAllTagsFromQuestion(questionId) {
  try {
    // Deletes all entries in the 'question_tags' junction table
    // that are linked to the given question ID.
    await pool.execute("DELETE FROM question_tags WHERE question_id = ?", [
      questionId,
    ]);
    return true; // Indicate success
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrFindTags,
  addTagsToQuestion,
  getTagsByQuestionId,
  getAllTags,
  removeAllTagsFromQuestion,
};
