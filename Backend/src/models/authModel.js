const pool = require("../config/database");

// ======================================================================
// 1. Function to create a new user in the database
// ======================================================================
async function createUser(username, email, hashedPassword) {
  const sql = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?);
    `;
  const [result] = await pool.execute(sql, [username, email, hashedPassword]);
  return result.insertId;
}

// ======================================================================
// 2. Function to find a user by their email
// ======================================================================
async function findByEmail(email) {
  const sql = `
        SELECT *
        FROM users
        WHERE email = ?;
    `;
  const [rows] = await pool.execute(sql, [email]);
  return rows[0];
}

// ======================================================================
// 3. Function to save the reset token and expiration to the user's record
// ======================================================================
async function saveResetToken(userId, token, expiration) {
  const sql = `
        UPDATE users
        SET password_reset_token = ?, password_reset_expires = ?
        WHERE id = ?;
    `;
  await pool.execute(sql, [token, expiration, userId]);
}

// ======================================================================
// 4. Function to find a user by their reset token
// ======================================================================
async function findByResetToken(token) {
  const sql = `
        SELECT id, password_reset_expires
        FROM users
        WHERE password_reset_token = ?;
    `;
  const [rows] = await pool.execute(sql, [token]);
  return rows[0];
}

// ======================================================================
// 5. Function to update the user's password and clear the reset token
// ======================================================================
async function updatePassword(userId, newPassword) {
  const sql = `
        UPDATE users
        SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL
        WHERE id = ?;
    `;
  await pool.execute(sql, [newPassword, userId]);
}

module.exports = {
  createUser,
  findByEmail,
  saveResetToken,
  findByResetToken,
  updatePassword,
};
