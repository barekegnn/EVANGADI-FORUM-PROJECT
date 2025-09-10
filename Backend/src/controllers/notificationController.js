const notificationModel = require("../models/notificationModel");

async function listUnread(req, res) {
  const { id: userId } = req.user;
  const { limit = 20, offset = 0 } = req.query;
  try {
    const notifications = await notificationModel.getUnreadNotifications(
      userId,
      limit,
      offset
    );
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error listing notifications:", error);
    res.status(500).json({ error: "Failed to list notifications" });
  }
}

async function markOneRead(req, res) {
  const { id: userId } = req.user;
  const { id } = req.params;
  try {
    const ok = await notificationModel.markAsRead(id, userId);
    if (!ok) return res.status(404).json({ error: "Notification not found" });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
}

async function markAllRead(req, res) {
  const { id: userId } = req.user;
  try {
    const count = await notificationModel.markAllAsRead(userId);
    res.status(200).json({ message: "All marked as read", count });
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
}

module.exports = { listUnread, markOneRead, markAllRead };
