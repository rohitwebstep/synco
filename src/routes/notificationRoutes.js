const express = require("express");
const router = express.Router();

const {
  createNotification,
  getUserNotifications,
  getAllNotifications,
  getNotificationsByCategory,
  markAllAsRead,
  markCategoryAsRead,
} = require("../controllers/notificationController");

router.post("/", createNotification); // Create new notification
router.get("/by-user", getUserNotifications); // Get notifications for a user
router.get("/", getAllNotifications); //get all notifications
router.get("/by-category", getNotificationsByCategory); // getnotification by category
router.put("/mark-all-read", markAllAsRead); // mark-all read route
router.put("/mark-category-read", markCategoryAsRead); //mark as read by category route

module.exports = router;
