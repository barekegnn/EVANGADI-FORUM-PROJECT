const pool = require("../config/database");

(async () => {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM users;");
    console.log("Users table columns:\n", columns);

    const [sample] = await pool.query("SELECT * FROM users LIMIT 5;");
    console.log("\nSample users rows (up to 5):\n", sample);
  } catch (err) {
    console.error("Inspection error:", err);
  } finally {
    try {
      await pool.end();
    } catch {}
  }
})();
