const { sequelize } = require("../config/db");

const Admin = require("./Admin");
const ActivityLog = require("./ActivityLog");
const Notification = require("./Notification");
const NotificationRecipient = require("./NotificationRecipient");
const EmailConfig = require("./Email");
const Member = require("./Member");
const MemberRole = require("./MemberRole");
const MemberPermission = require("./MemberPermission");
const MemberHasPermission = require("./MemberHasPermission");

// Define all associations **before** exporting models

// 🧾 Admin -> ActivityLogs
Admin.hasMany(ActivityLog, {
  foreignKey: {
    name: "adminId",
    allowNull: false,
  },
  as: "activityLogs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ActivityLog.belongsTo(Admin, {
  foreignKey: {
    name: "adminId",
    allowNull: false,
  },
  as: "admin",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 📬 Admin -> Notifications (sender)
Admin.hasMany(Notification, {
  foreignKey: {
    name: "senderId",
    allowNull: false,
  },
  as: "sentNotifications",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Notification.belongsTo(Admin, {
  foreignKey: {
    name: "senderId",
    allowNull: false,
  },
  as: "sender",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 📤 Notification -> Recipients
Notification.hasMany(NotificationRecipient, {
  foreignKey: {
    name: "notificationId",
    allowNull: false,
  },
  as: "recipients",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
NotificationRecipient.belongsTo(Notification, {
  foreignKey: {
    name: "notificationId",
    allowNull: false,
  },
  as: "notification",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 📥 Admin -> NotificationRecipients (recipient)
Admin.hasMany(NotificationRecipient, {
  foreignKey: {
    name: "recipientId",
    allowNull: false,
  },
  as: "receivedNotifications",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
NotificationRecipient.belongsTo(Admin, {
  foreignKey: {
    name: "recipientId",
    allowNull: false,
  },
  as: "recipient",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Member.belongsTo(MemberRole, { foreignKey: "roleId", as: "role" });
MemberRole.hasMany(Member, { foreignKey: "roleId", as: "members" });

// 👥 Member -> MemberHasPermission
Member.hasMany(MemberHasPermission, {
  foreignKey: "memberId",
  as: "permissions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
MemberHasPermission.belongsTo(Member, {
  foreignKey: "memberId",
  as: "member",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 🔐 MemberPermission -> MemberHasPermission
MemberPermission.hasMany(MemberHasPermission, {
  foreignKey: "permissionId",
  as: "memberAssignments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
MemberHasPermission.belongsTo(MemberPermission, {
  foreignKey: "permissionId",
  as: "permission",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = {
  sequelize,
  Admin,
  ActivityLog,
  Notification,
  NotificationRecipient,
  EmailConfig,
  Member,
  MemberRole,
  MemberPermission,
  MemberHasPermission
};
