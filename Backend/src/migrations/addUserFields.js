// Migration script to add additional fields to users table
const pool = require("../config/database");

async function addAdditionalUserFields() {
  try {
    // Add bio column if it doesn't exist
    try {
      await pool.execute("ALTER TABLE users ADD COLUMN bio TEXT NULL");
      console.log("Successfully added bio column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding bio column:", error);
      } else {
        console.log("bio column already exists in users table");
      }
    }

    // Add phone column if it doesn't exist
    try {
      await pool.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL");
      console.log("Successfully added phone column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding phone column:", error);
      } else {
        console.log("phone column already exists in users table");
      }
    }

    // Add location column if it doesn't exist
    try {
      await pool.execute(
        "ALTER TABLE users ADD COLUMN location VARCHAR(100) NULL"
      );
      console.log("Successfully added location column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding location column:", error);
      } else {
        console.log("location column already exists in users table");
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await pool.end();
  }
}

// Run the migration
addAdditionalUserFields();
