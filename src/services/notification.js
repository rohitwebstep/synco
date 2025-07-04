const { Notification, NotificationRecipient, User } = require("../models");
const { Op } = require("sequelize");

// Create a notification
exports.createNotification = async (title, message, category, senderId) => {
  const notification = await Notification.create({
    title,
    message,
    category,
    senderId,
  });
  return notification.id;
};

// Add multiple recipients to a notification
exports.addNotificationRecipients = async (notificationId, recipientIds) => {
  const data = recipientIds.map((recipientId) => ({
    notificationId,
    recipientId,
  }));
  await NotificationRecipient.bulkCreate(data);
};

// Get notifications for a specific user
exports.getNotificationsForUser = async (userId) => {
  return await Notification.findAll({
    include: [
      {
        model: NotificationRecipient,
        as: "recipients",
        where: { recipientId: userId },
        attributes: ["readAt"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
};

// Get all notifications with sender name and recipient count
exports.getAllNotifications = async () => {
  const notifications = await Notification.findAll({
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "name"],
      },
      {
        model: NotificationRecipient,
        as: "recipients",
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [
          Notification.sequelize.fn(
            "COUNT",
            Notification.sequelize.col("recipients.id")
          ),
          "recipientCount",
        ],
      ],
    },
    group: ["Notification.id"],
    order: [["createdAt", "ASC"]],
  });

  return notifications;
};

// Get notifications by category
exports.getNotificationsByCategory = async (category) => {
  const notifications = await Notification.findAll({
    where: { category },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "name"],
      },
      {
        model: NotificationRecipient,
        as: "recipients",
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [
          Notification.sequelize.fn(
            "COUNT",
            Notification.sequelize.col("recipients.id")
          ),
          "recipientCount",
        ],
      ],
    },
    group: ["Notification.id"],
    order: [["createdAt", "ASC"]],
  });

  return notifications;
};

// Mark all notifications as read for a recipient
exports.markAllNotificationsAsRead = async (recipientId) => {
  return await NotificationRecipient.update(
    { readAt: new Date() },
    {
      where: {
        recipientId,
        readAt: null,
      },
    }
  );
};

// Mark notifications by category as read for a recipient
exports.markNotificationsByCategoryAsRead = async (recipientId, category) => {
  const updated = await NotificationRecipient.update(
    { readAt: new Date() },
    {
      where: {
        recipientId,
        readAt: null,
      },
      include: [
        {
          model: Notification,
          as: "notification",
          where: { category },
        },
      ],
    }
  );
  return updated;
};

// Find unread notifications by recipient and category
exports.findUnreadByRecipientAndCategory = async (recipientId, category) => {
  return await Notification.findAll({
    where: { category },
    include: [
      {
        model: NotificationRecipient,
        as: "recipients",
        where: {
          recipientId,
          readAt: null,
        },
      },
    ],
  });
};
