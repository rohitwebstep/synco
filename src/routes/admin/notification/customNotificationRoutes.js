const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/admin/authenticate");

const {
    createCustomNotification
} = require("../../../controllers/admin/notification/customNotificationController");

// Create a new notification
router.post("/", authMiddleware, createCustomNotification);

module.exports = router;
