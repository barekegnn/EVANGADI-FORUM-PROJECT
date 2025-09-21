const pool = require("../config/database");

//1.Function to find a user by their ID.
// Used by the authMiddleware to get user data from the token.
async function findById(id) {
  const sql = `
    SELECT id, username, email
    FROM users
    WHERE id = ?;
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
}

//2.Function to update a user's profile by their ID.
async function updateById(id, { username, email }) {
  const sql = `
    UPDATE users
    SET username = ?, email = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [username, email, id]);
  // After updating, we find the user again to return the new data.
  const updatedUser = await findById(id);
  return updatedUser;
}

//3.Function to update user reputation
async function updateReputation(userId, reputationChange) {
  const sql = `
    UPDATE users
    SET reputation = reputation + ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [reputationChange, userId]);
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

//5.Function to update notification preferences
async function updateNotificationPreferences(userId, preferences) {
  const sql = `
    UPDATE users
    SET notification_preferences = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [JSON.stringify(preferences), userId]);
}

//6.Function to get notification preferences
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

//7.Function to update expertise tags
async function updateExpertiseTags(userId, expertiseTags) {
  const sql = `
    UPDATE users
    SET expertise_tags = ?
    WHERE id = ?;
  `;
  await pool.execute(sql, [JSON.stringify(expertiseTags), userId]);
}

//8.Function to get expertise tags
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
  updateReputation,
  getReputation,
  updateNotificationPreferences,
  getNotificationPreferences,
  updateExpertiseTags,
  getExpertiseTags,
};
