const { sequelize } = require("../config/db");

// ====================== Model Imports ====================== //
const Admin = require("./Admin");
const ActivityLog = require("./ActivityLog");
const EmailConfig = require("./Email");

const Member = require("./member/Member");
const MemberRole = require("./member/MemberRole");
const MemberPermission = require("./member/MemberPermission");
const MemberHasPermission = require("./member/MemberHasPermission");

const Notification = require("./notification/Notification");
const NotificationRead = require("./notification/NotificationRead");

const PaymentPlan = require("./payment/PaymentPlan");
const PaymentGroup = require("./payment/PaymentGroup");
const PaymentGroupHasPlan = require("./payment/PaymentGroupHasPlan");

const Discount = require("./discount/Discount");
const DiscountAppliesTo = require("./discount/DiscountAppliesTo");
const DiscountUsage = require("./discount/DiscountUsage");

const Country = require("./location/Country");
const State = require("./location/State");
const City = require("./location/City");

// ====================== Model Associations ====================== //

/* 🌐 Admin Relations */

// Admin ↔ ActivityLog
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

// Admin ↔ Notification (sent)
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

// Admin ↔ NotificationRead (who read)
Admin.hasMany(NotificationRead, {
  foreignKey: "adminId",
  as: "adminReads",
});
NotificationRead.belongsTo(Admin, {
  foreignKey: "adminId",
  as: "admin",
});

/* 👥 Member Relations */

// Member ↔ Role
Member.belongsTo(MemberRole, {
  foreignKey: "roleId",
  as: "role",
});
MemberRole.hasMany(Member, {
  foreignKey: "roleId",
  as: "members",
});

// Member ↔ MemberHasPermission
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

// MemberPermission ↔ MemberHasPermission
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

/* 💳 PaymentGroup ↔ PaymentPlan (Many-to-Many) */

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

/* 🌍 Location Relations */

// Country ↔ State
Country.hasMany(State, {
  foreignKey: "countryId",
  as: "states",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
State.belongsTo(Country, {
  foreignKey: "countryId",
  as: "country",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// State ↔ City
State.hasMany(City, {
  foreignKey: "stateId",
  as: "cities",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
City.belongsTo(State, {
  foreignKey: "stateId",
  as: "state",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Country ↔ City (direct access)
Country.hasMany(City, {
  foreignKey: "countryId",
  as: "cities",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
City.belongsTo(Country, {
  foreignKey: "countryId",
  as: "country",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/* 🎟️ Discount System Relations */

// Discount ↔ DiscountAppliesTo
Discount.hasMany(DiscountAppliesTo, {
  foreignKey: "discountId",
  as: "appliesTo",
  onDelete: "CASCADE",
});
DiscountAppliesTo.belongsTo(Discount, {
  foreignKey: "discountId",
  as: "discount",
  onDelete: "CASCADE",
});

// Discount ↔ DiscountUsage
Discount.hasMany(DiscountUsage, {
  foreignKey: "discountId",
  as: "usages",
  onDelete: "CASCADE",
});
DiscountUsage.belongsTo(Discount, {
  foreignKey: "discountId",
  as: "discount",
  onDelete: "CASCADE",
});

// Member ↔ DiscountUsage
Member.hasMany(DiscountUsage, {
  foreignKey: "memberId",
  as: "discountUsages",
  onDelete: "CASCADE",
});
DiscountUsage.belongsTo(Member, {
  foreignKey: "memberId",
  as: "member",
  onDelete: "CASCADE",
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
  DiscountAppliesTo,
  DiscountUsage,
  Country,
  State,
  City
};
