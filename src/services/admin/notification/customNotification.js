const { CustomNotification, CustomNotificationRead, Admin, Member } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create a notification
exports.createCustomNotification = async (title, description, category, adminId) => {
  try {
    const notification = await CustomNotification.create({
      title: title || null,
      description: description || null,
      category,
      adminId,
      createdAt: new Date(),
    });

    return {
      status: true,
      data: {
        id: notification.id,
      },
      message: "Notification created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to create notification. ${error.message}`,
    };
  }
};

// ✅ Create a read record for a custom notification
exports.createCustomNotificationReads = async ({ customNotificationId, memberId, status = false }) => {
  try {
    console.log(`{ customNotificationId, memberId, status = false } - `, { customNotificationId, memberId, status });
    const readRecord = await CustomNotificationRead.create({
      customNotificationId,
      memberId,
      status,
      createdAt: new Date(),
    });

    return {
      status: true,
      data: {
        id: readRecord.id,
      },
      message: "Notification read record created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to create notification read record. ${error.message}`,
    };
  }
};

// ✅ Get all custom notifications
exports.getAllCustomNotifications = async () => {
  try {
    const notifications = await CustomNotification.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: CustomNotificationRead,
          as: 'reads',
          attributes: ['id', 'memberId', 'status', 'createdAt'],
          include: [
            {
              model: Member,
              as: 'member',
              attributes: ['id', 'firstName', 'lastName', 'email', 'profile']
            }
          ]
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'name', 'email'],
        }
      ]
    });

    return {
      status: true,
      message: "Custom notifications fetched successfully.",
      data: notifications,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getAllCustomNotifications:", error);
    return {
      status: false,
      message: `Error fetching custom notifications. ${error.message}`,
    };
  }
};
