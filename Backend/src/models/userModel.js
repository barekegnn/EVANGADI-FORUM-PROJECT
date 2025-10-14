const pool = require("../config/database");

//1.Function to find a user by their ID.
// Used by the authMiddleware to get user data from the token.
async function findById(id) {
  const sql = `
    SELECT id, username, email, profile_picture, bio, phone, location, telegram, campus, year_of_study, field_of_study
    FROM users
    WHERE id = ?;
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
}

//2.Function to update a user's profile by their ID.
async function updateById(
  id,
  {
    username,
    email,
    bio,
    phone,
    location,
    telegram,
    campus,
    yearOfStudy,
    fieldOfStudy,
  }
) {
  const sql = `
    UPDATE users
    SET username = ?, email = ?, bio = ?, phone = ?, location = ?, telegram = ?, campus = ?, year_of_study = ?, field_of_study = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [
    username,
    email,
    bio,
    phone,
    location,
    telegram,
    campus,
    yearOfStudy,
    fieldOfStudy,
    id,
  ]);
  // After updating, we find the user again to return the new data.
  const updatedUser = await findById(id);
  return updatedUser;
}

// Function to update a user's profile picture
async function updateProfilePicture(id, profilePicturePath) {
  const sql = `
    UPDATE users
    SET profile_picture = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [profilePicturePath, id]);
  // After updating, we find the user again to return the new data.
  const updatedUser = await findById(id);
  return updatedUser;
}

//3.Function to update user reputation with retry mechanism
async function updateReputation(userId, reputationChange) {
  const maxRetries = 3;
  const baseDelay = 100; // ms

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const sql = `
        UPDATE users
        SET reputation = reputation + ?
        WHERE id = ?;
      `;
      await pool.execute(sql, [reputationChange, userId]);
      return; // Success, exit the function
    } catch (error) {
      // If it's a lock wait timeout and we have retries left, wait and try again
      if (error.code === "ER_LOCK_WAIT_TIMEOUT" && attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If it's not a retryable error or we've exhausted retries, throw the error
      throw error;
    }
  }
}

//4.Function to get user reputation
async function getReputation(userId) {
  const sql = `
    SELECT reputation
    FROM users
    WHERE id = ?;
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0]?.reputation || 0;
}

//5.Function to get user questions count
async function getQuestionsCount(userId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM questions
    WHERE user_id = ?;
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0]?.count || 0;
}

//6.Function to get user answers count
async function getAnswersCount(userId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM answers
    WHERE user_id = ?;
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0]?.count || 0;
}

//7.Function to update notification preferences
async function updateNotificationPreferences(userId, preferences) {
  const sql = `
    UPDATE users
    SET notification_preferences = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [JSON.stringify(preferences), userId]);
}

//8.Function to get notification preferences
async function getNotificationPreferences(userId) {
  const sql = `
    SELECT notification_preferences
    FROM users
    WHERE id = ?;
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const prefData = rows[0]?.notification_preferences;

  if (!prefData) return {};

  try {
    return JSON.parse(prefData);
  } catch (error) {
    console.error("Error parsing notification preferences:", error);
    return {};
  }
}

//9.Function to update expertise tags
async function updateExpertiseTags(userId, expertiseTags) {
  const sql = `
    UPDATE users
    SET expertise_tags = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [JSON.stringify(expertiseTags), userId]);
}

//10.Function to get expertise tags
async function getExpertiseTags(userId) {
  const sql = `
    SELECT expertise_tags
    FROM users
    WHERE id = ?;
  `;
  const [rows] = await pool.execute(sql, [userId]);
  const tagData = rows[0]?.expertise_tags;

  if (!tagData) return [];

  try {
    return JSON.parse(tagData);
  } catch (error) {
    console.error("Error parsing expertise tags:", error);
    return [];
  }
}

module.exports = {
  findById,
  updateById,
  updateProfilePicture,
  updateReputation,
  getReputation,
  getQuestionsCount,
  getAnswersCount,
  updateNotificationPreferences,
  getNotificationPreferences,
  updateExpertiseTags,
  getExpertiseTags,
};
