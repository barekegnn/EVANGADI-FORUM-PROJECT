// backend/src/models/userModel.js

// Import the database connection pool
const pool = require("../config/database");

// ======================================================================
// Helper function to find a user by their email
// This is used during login and registration to check if a user already exists
// ======================================================================
async function findUserByEmail(email) {
  // The pool.execute() method uses prepared statements, which is crucial for security
  // The '?' is a placeholder that is replaced by the 'email' variable
  const [rows] = await pool.execute(
    "SELECT id, username, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  // The result is an array. We return the first element, which is the user object, or undefined if not found.
  return rows[0];
}

// ======================================================================
// Function to create a new user in the database
// ======================================================================
async function createUser(username, email, passwordHash) {
  const [result] = await pool.execute(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash]
  );
  // The result object contains information about the insert operation.
  // We return the ID of the new user.
  return result.insertId;
}

// ======================================================================
// Function to find a user by their ID
// Used for fetching a user's details after they log in
// ======================================================================
async function findUserById(userId) {
  const [rows] = await pool.execute(
    "SELECT id, username, email FROM users WHERE id = ?",
    [userId]
  );
  return rows[0];
}

// Export the functions so they can be used in other files (like the controller)
module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};
