const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/member/authenticate");

const {
  getAllNotifications,
  markCustomNotificationAsRead
} = require("../../../controllers/member/notification/notificationController");

// Get all notifications
router.get("/", authMiddleware, getAllNotifications);

// Mark a notification as read (expects notificationId in body or query)
router.patch("/read", authMiddleware, markCustomNotificationAsRead);

module.exports = router;
