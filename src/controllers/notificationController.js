const notificationModel = require("../services/notification");
const { logActivity } = require("../utils/activityLog");

const validCategories = ["Complaints", "Payments", "Cancelled Memberships"];

// ✅ Create a new notification
exports.createNotification = async (req, res) => {
  const { title, message, category, sender_id, recipients } = req.body;

  if (!title || !message || !category || !sender_id || !Array.isArray(recipients)) {
    return res.status(400).json({ message: "Title, message, category, sender ID, and recipients array are required." });
  }

  if (!validCategories.includes(category)) {
    return res.status(422).json({ message: `Invalid category. Valid categories are: ${validCategories.join(", ")}` });
  }

  try {
    const notification_id = await notificationModel.createNotification(
      title, message, category, sender_id
    );

    await notificationModel.addNotificationRecipients(notification_id, recipients);

    await logActivity({
      user_id: sender_id,
      action: "Created notification",
      module: "Notifications",
      description: `Sent '${category}' notification to ${recipients.length} user(s): "${title}"`,
    });

    return res.status(201).json({
      message: "Notification created and assigned successfully.",
      notification_id,
    });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return res.status(500).json({ message: "Failed to create notification. Please try again later." });
  }
};

// ✅ Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const notifications = await notificationModel.getNotificationsForUser(user_id);

    await logActivity({
      user_id,
      action: "Viewed personal notifications",
      module: "Notifications",
      description: "User viewed their own notifications",
    });

    return res.status(200).json({
      message: `Fetched ${notifications.length} notification(s) successfully.`,
      notifications,
    });
  } catch (error) {
    console.error("❌ Error fetching user notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications. Please try again later." });
  }
};

// ✅ Admin: Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.getAllNotifications();

    await logActivity({
      user_id: 0,
      action: "Viewed all notifications",
      module: "Notifications",
      description: "Admin fetched all system notifications",
    });

    return res.status(200).json({
      message: `Fetched ${notifications.length} notification(s).`,
      notifications,
    });
  } catch (error) {
    console.error("❌ Error fetching all notifications:", error);
    return res.status(500).json({ message: "Failed to fetch all notifications." });
  }
};

// ✅ Filter notifications by category
exports.getNotificationsByCategory = async (req, res) => {
  const { category, recipient_id } = req.body;

  if (!category || !validCategories.includes(category)) {
    return res.status(422).json({ message: `Invalid or missing category. Allowed values: ${validCategories.join(", ")}` });
  }

  if (!recipient_id) {
    return res.status(400).json({ message: "Recipient ID is required." });
  }

  try {
    const data = await notificationModel.getNotificationsByCategory(category);

    await logActivity({
      user_id: recipient_id,
      action: "Viewed notifications by category",
      module: "Notifications",
      description: `Viewed '${category}' notifications`,
    });

    return res.status(200).json({
      message: `Fetched ${data.length} '${category}' notification(s).`,
      data,
    });
  } catch (error) {
    console.error("❌ Error filtering notifications by category:", error);
    return res.status(500).json({ message: "Unable to filter notifications. Please try again later." });
  }
};

// ✅ Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  const { recipient_id } = req.body;

  if (!recipient_id) {
    return res.status(400).json({ message: "Recipient ID is required." });
  }

  try {
    const result = await notificationModel.markAllNotificationsAsRead(recipient_id);

    if (result[0] === 0) {
      return res.status(404).json({ message: "No unread notifications found to mark as read." });
    }

    await logActivity({
      user_id: recipient_id,
      action: "Marked all notifications as read",
      module: "Notifications",
      description: `Marked all notifications as read for recipient ID ${recipient_id}`,
    });

    return res.status(200).json({ message: "All notifications have been marked as read." });
  } catch (error) {
    console.error("❌ Error marking all as read:", error);
    return res.status(500).json({ message: "Failed to mark notifications as read." });
  }
};

// ✅ Mark specific category notifications as read
exports.markCategoryAsRead = async (req, res) => {
  const { recipient_id, category } = req.body;

  if (!recipient_id || !category || !validCategories.includes(category)) {
    return res.status(422).json({ message: "Recipient ID and a valid category are required." });
  }

  try {
    const unread = await notificationModel.findUnreadByRecipientAndCategory(recipient_id, category);

    if (!unread || unread.length === 0) {
      return res.status(404).json({
        message: `No unread '${category}' notifications found for recipient ID ${recipient_id}.`,
      });
    }

    await notificationModel.markNotificationsByCategoryAsRead(recipient_id, category);

    await logActivity({
      user_id: recipient_id,
      action: "Marked notifications as read by category",
      module: "Notifications",
      description: `Marked all '${category}' notifications as read for recipient ID ${recipient_id}`,
    });

    return res.status(200).json({
      message: `All '${category}' notifications marked as read.`,
    });
  } catch (error) {
    console.error("❌ Error marking category as read:", error);
    return res.status(500).json({ message: "Failed to update notification read status." });
  }
};
