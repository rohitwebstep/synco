const { sequelize } = require("../config/db");

// =================== Import All Models =================== //
const models = {
  // 🌐 Core
  Admin: require("./admin/Admin"),
  EmailConfig: require("./Email"),

  // 📋 Activity & Logs
  ActivityLog: require("./admin/ActivityLog"),

  // 👥 Admin Roles & Permission
  AdminRole: require("./admin/AdminRole"),
  AdminPermission: require("./admin/permission/AdminPermission"),
  AdminHasPermission: require("./admin/permission/AdminHasPermission"),

  // 🔔 Notifications
  Notification: require("./admin/notification/Notification"),
  NotificationRead: require("./admin/notification/NotificationRead"),
  CustomNotification: require("./admin/notification/CustomNotification"),
  CustomNotificationRead: require("./admin/notification/CustomNotificationRead"),

  // 💳 Payment System
  PaymentPlan: require("./admin/payment/PaymentPlan"),
  PaymentGroup: require("./admin/payment/PaymentGroup"),
  PaymentGroupHasPlan: require("./admin/payment/PaymentGroupHasPlan"),

  // 🎟️ Discount System
  Discount: require("./admin/discount/Discount"),
  DiscountAppliesTo: require("./admin/discount/DiscountAppliesTo"),
  DiscountUsage: require("./admin/discount/DiscountUsage"),

  // 🌍 Location System
  Country: require("./admin/location/Country"),
  State: require("./admin/location/State"),
  City: require("./admin/location/City"),
};

// =================== Apply Model-Level Associations =================== //
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// ====================== 🔗 Manual Relationships ====================== //

const {
  Admin, AdminRole, EmailConfig, ActivityLog, Notification, NotificationRead,
  CustomNotification, CustomNotificationRead,
  Country, State, City, PaymentPlan, PaymentGroup,
  PaymentGroupHasPlan, Discount, DiscountAppliesTo,
  DiscountUsage
} = models;

// 🌐 Admin ↔ Notifications
Admin.hasMany(Notification, { foreignKey: "adminId", as: "sentNotifications", onDelete: "CASCADE" });
Notification.belongsTo(Admin, { foreignKey: "adminId", as: "sender", onDelete: "CASCADE" });

Admin.hasMany(NotificationRead, { foreignKey: "adminId", as: "notificationReads" });
NotificationRead.belongsTo(Admin, { foreignKey: "adminId", as: "admin" });

// 💳 PaymentGroup ↔ PaymentPlan (Many-to-Many)
PaymentGroup.belongsToMany(PaymentPlan, {
  through: PaymentGroupHasPlan,
  foreignKey: "payment_group_id",
  otherKey: "payment_plan_id",
  as: "plans"
});
PaymentPlan.belongsToMany(PaymentGroup, {
  through: PaymentGroupHasPlan,
  foreignKey: "payment_plan_id",
  otherKey: "payment_group_id",
  as: "groups"
});

// 🎟️ Discounts
Discount.hasMany(DiscountAppliesTo, { foreignKey: "discountId", as: "appliesTo", onDelete: "CASCADE" });
DiscountAppliesTo.belongsTo(Discount, { foreignKey: "discountId", as: "discount", onDelete: "CASCADE" });

Discount.hasMany(DiscountUsage, { foreignKey: "discountId", as: "usages", onDelete: "CASCADE" });
DiscountUsage.belongsTo(Discount, { foreignKey: "discountId", as: "discount", onDelete: "CASCADE" });


// ====================== 📦 Module Exports ====================== //
module.exports = {
  sequelize,
  Admin,
  AdminRole,
  
  ActivityLog,
  EmailConfig,

  Notification,
  NotificationRead,
  CustomNotification,
  CustomNotificationRead,

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
