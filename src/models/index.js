const { sequelize } = require("../config/db");

// ====================== 🌐 Core Models ====================== //
const Admin = require("./admin/Admin");
const EmailConfig = require("./Email");

// ====================== 📋 Activity & Logs ====================== //
const ActivityLog = require("./admin/ActivityLog");

// ====================== 👥 Member & Roles ====================== //
const Member = require("./admin/member/Member");
const MemberRole = require("./admin/member/MemberRole");
const MemberPermission = require("./admin/member/MemberPermission");
const MemberHasPermission = require("./admin/member/MemberHasPermission");

// ====================== 🔔 Notifications ====================== //
const Notification = require("./admin/notification/Notification");
const NotificationRead = require("./admin/notification/NotificationRead");

// ====================== 💳 Payment System ====================== //
const PaymentPlan = require("./admin/payment/PaymentPlan");
const PaymentGroup = require("./admin/payment/PaymentGroup");
const PaymentGroupHasPlan = require("./admin/payment/PaymentGroupHasPlan");

// ====================== 🎟️ Discount System ====================== //
const Discount = require("./admin/discount/Discount");
const DiscountAppliesTo = require("./admin/discount/DiscountAppliesTo");
const DiscountUsage = require("./admin/discount/DiscountUsage");

// ====================== 🌍 Location System ====================== //
const Country = require("./admin/location/Country");
const State = require("./admin/location/State");
const City = require("./admin/location/City");


// ====================== 🔗 Model Associations ====================== //

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

// Member ↔ Country
Member.belongsTo(Country, {
  foreignKey: "countryId",
  as: "country",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Country.hasMany(Member, {
  foreignKey: "countryId",
  as: "membersFromCountry",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Member ↔ State
Member.belongsTo(State, {
  foreignKey: "stateId",
  as: "state",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
State.hasMany(Member, {
  foreignKey: "stateId",
  as: "membersFromState",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Member ↔ City
Member.belongsTo(City, {
  foreignKey: "cityId",
  as: "city",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
City.hasMany(Member, {
  foreignKey: "cityId",
  as: "membersFromCity",
  onDelete: "SET NULL",
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


/* 🎟️ Discount System */

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


// ====================== 📦 Module Exports ====================== //
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
  City,
};
