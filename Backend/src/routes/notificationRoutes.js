const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  listUnread,
  getUnreadCount,
  markOneRead,
  markAllRead,
} = require("../controllers/notificationController");

router.get("/unread", protect, listUnread);
router.get("/unread/count", protect, getUnreadCount);
router.post("/:id/read", protect, markOneRead);
router.post("/read-all", protect, markAllRead);

module.exports = router;
