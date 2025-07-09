const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createNotification,
  getAllNotifications,
  getNotificationsByCategory,
  markNotificationAsRead,
} = require("../../controllers/admin/notificationController");

// Create a new notification
router.post("/", authMiddleware, createNotification);

// Mark a notification as read (expects notificationId in body or query)
router.patch("/read", authMiddleware, markNotificationAsRead);

// Get all notifications
router.get("/", authMiddleware, getAllNotifications);

// Get notifications by category
router.get("/category/:category", authMiddleware, getNotificationsByCategory);

module.exports = router;
