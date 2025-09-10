require("dotenv").config();
const pool = require("../config/database");

async function ensureNotificationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipient_user_id INT NOT NULL,
      type VARCHAR(64) NOT NULL,
      entity_id INT NULL,
      message VARCHAR(255) NOT NULL,
      context JSON NULL,
      read_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_user_created (recipient_user_id, created_at DESC),
      CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
  console.log("Notifications table ensured.");
  process.exit(0);
}

ensureNotificationsTable().catch((err) => {
  console.error("Failed to ensure notifications table:", err);
  process.exit(1);
});
