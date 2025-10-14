// Migration script to add profile_picture column to users table
const pool = require("../config/database");

async function addProfilePictureColumn() {
  try {
    // Check if the column already exists
    const [rows] = await pool.execute(
      "SHOW COLUMNS FROM users LIKE 'profile_picture'"
    );

    if (rows.length === 0) {
      // Add the profile_picture column if it doesn't exist
      await pool.execute(
        "ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) NULL AFTER email"
      );
      console.log("Successfully added profile_picture column to users table");
    } else {
      console.log("profile_picture column already exists in users table");
    }
  } catch (error) {
    console.error("Error adding profile_picture column:", error);
  } finally {
    await pool.end();
  }
}

// Run the migration
addProfilePictureColumn();
