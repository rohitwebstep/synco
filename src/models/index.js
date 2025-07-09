const { sequelize } = require("../config/db");

// ====================== Model Imports ====================== //
const Admin = require("./Admin");
const ActivityLog = require("./ActivityLog");
const EmailConfig = require("./Email");
const Member = require("./Member");
const MemberRole = require("./MemberRole");
const MemberPermission = require("./MemberPermission");
const MemberHasPermission = require("./MemberHasPermission");
const Notification = require("./Notification");
const NotificationRead = require("./NotificationRead");
const PaymentPlan = require("./PaymentPlan");
const PaymentGroup = require("./PaymentGroup");
const PaymentGroupHasPlan = require("./PaymentGroupHasPlan");
const Discount = require("./Discount");

// ====================== Associations ====================== //

// 🧾 Admin -> ActivityLog
Admin.hasMany(ActivityLog, {
  foreignKey: { name: "adminId", allowNull: false },
  as: "activityLogs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ActivityLog.belongsTo(Admin, {
  foreignKey: { name: "adminId", allowNull: false },
  as: "admin",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 📬 Admin -> Notification (sent)
Admin.hasMany(Notification, {
  foreignKey: { name: "adminId", allowNull: false },
  as: "sentNotifications",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Notification.belongsTo(Admin, {
  foreignKey: { name: "adminId", allowNull: false },
  as: "sender",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 👀 NotificationRead: Admin side
Admin.hasMany(NotificationRead, {
  foreignKey: "adminId",
  as: "adminReads",
});
NotificationRead.belongsTo(Admin, {
  foreignKey: "adminId",
  as: "admin",
});

// 👥 Member -> Role
Member.belongsTo(MemberRole, {
  foreignKey: "roleId",
  as: "role",
});
MemberRole.hasMany(Member, {
  foreignKey: "roleId",
  as: "members",
});

// 🔐 Member -> MemberHasPermission
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

// 🔐 Permission -> MemberHasPermission
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

// 💳 PaymentGroup <-> PaymentPlan (Many-to-Many)
PaymentGroup.belongsToMany(PaymentPlan, {
  through: PaymentGroupHasPlan,
  foreignKey: "payment_group_id",
  otherKey: "payment_plan_id",
  as: "plans",
});
PaymentPlan.belongsToMany(PaymentGroup, {
  through: PaymentGroupHasPlan,
  foreignKey: "payment_plan_id",
  otherKey: "payment_group_id",
  as: "groups",
});

// ====================== Module Exports ====================== //
module.exports = {
  sequelize,
  Admin,
  ActivityLog,
  EmailConfig,
  Member,
  MemberRole,
  MemberPermission,
  MemberHasPermission,
  Notification,
  NotificationRead,
  PaymentPlan,
  PaymentGroup,
  PaymentGroupHasPlan,
  Discount,
};
