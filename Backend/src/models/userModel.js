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

module.exports = {
  findById,
  updateById,
};
