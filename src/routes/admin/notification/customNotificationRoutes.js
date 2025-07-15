const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/admin/authenticate");

const {
    createCustomNotification,
    markNotificationAsRead,
    getAllCustomNotifications
} = require("../../../controllers/admin/notification/customNotificationController");

// Create a new notification
router.post("/", authMiddleware, createCustomNotification);

// Mark a notification as read (expects notificationId in body or query)
router.patch("/read", authMiddleware, markNotificationAsRead);

// Get all notifications
router.get("/", authMiddleware, getAllCustomNotifications);

module.exports = router;
