// Migration script to add academic fields to users table
const pool = require("../config/database");

async function addAcademicFields() {
  try {
    // Add telegram column if it doesn't exist
    try {
      await pool.execute(
        "ALTER TABLE users ADD COLUMN telegram VARCHAR(50) NULL"
      );
      console.log("Successfully added telegram column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding telegram column:", error);
      } else {
        console.log("telegram column already exists in users table");
      }
    }

    // Add campus column if it doesn't exist
    try {
      await pool.execute(
        "ALTER TABLE users ADD COLUMN campus VARCHAR(50) NULL"
      );
      console.log("Successfully added campus column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding campus column:", error);
      } else {
        console.log("campus column already exists in users table");
      }
    }

    // Add year_of_study column if it doesn't exist
    try {
      await pool.execute(
        "ALTER TABLE users ADD COLUMN year_of_study VARCHAR(10) NULL"
      );
      console.log("Successfully added year_of_study column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding year_of_study column:", error);
      } else {
        console.log("year_of_study column already exists in users table");
      }
    }

    // Add field_of_study column if it doesn't exist
    try {
      await pool.execute(
        "ALTER TABLE users ADD COLUMN field_of_study VARCHAR(100) NULL"
      );
      console.log("Successfully added field_of_study column to users table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error("Error adding field_of_study column:", error);
      } else {
        console.log("field_of_study column already exists in users table");
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
addAcademicFields();
