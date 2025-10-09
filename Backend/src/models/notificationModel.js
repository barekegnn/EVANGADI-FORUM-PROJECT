const pool = require("../config/database");

// Notification types: 'QUESTION_CREATED', 'ANSWER_CREATED', etc.
async function createNotification(
  recipientUserId,
  type,
  entityId,
  message,
  context = null
) {
  const sql = `
    INSERT INTO notifications (recipient_user_id, type, entity_id, message, context)
    VALUES (?, ?, ?, ?, ?);
  `;
  const [result] = await pool.execute(sql, [
    recipientUserId,
    type,
    entityId,
    message,
    context,
  ]);
  return result.insertId;
}

async function createNotificationsBulk(rows) {
  if (!rows || rows.length === 0) return [];
  const values = rows.map((r) => [
    r.recipientUserId,
    r.type,
    r.entityId,
    r.message,
    r.context ?? null,
  ]);
  const sql = `INSERT INTO notifications (recipient_user_id, type, entity_id, message, context) VALUES ?`;
  const [result] = await pool.query(sql, [values]);
  // We won't compute IDs here; caller can refetch if needed
  return result.affectedRows;
}

async function getUnreadNotifications(recipientUserId, limit = 20, offset = 0) {
  const sql = `
    SELECT id, recipient_user_id, type, entity_id, message, context, created_at
    FROM notifications
    WHERE recipient_user_id = ? AND read_at IS NULL
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?;
  `;
  const [rows] = await pool.execute(sql, [
    recipientUserId,
    Number(limit),
    Number(offset),
  ]);
  return rows;
}

async function getUnreadNotificationCount(recipientUserId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE recipient_user_id = ? AND read_at IS NULL;
  `;
  const [rows] = await pool.execute(sql, [recipientUserId]);
  return rows[0].count;
}

async function markAsRead(notificationId, recipientUserId) {
  const sql = `
    UPDATE notifications SET read_at = NOW()
    WHERE id = ? AND recipient_user_id = ? AND read_at IS NULL;
  `;
  const [result] = await pool.execute(sql, [notificationId, recipientUserId]);
  return result.affectedRows > 0;
}

async function markAllAsRead(recipientUserId) {
  const sql = `
    UPDATE notifications SET read_at = NOW()
    WHERE recipient_user_id = ? AND read_at IS NULL;
  `;
  const [result] = await pool.execute(sql, [recipientUserId]);
  return result.affectedRows;
}

module.exports = {
  createNotification,
  createNotificationsBulk,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationCount,
};
