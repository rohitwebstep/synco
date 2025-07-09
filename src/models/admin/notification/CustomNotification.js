// models/CustomNotification.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const CustomNotification = sequelize.define(
  "CustomNotification",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "Complaints",
        "Payments",
        "Cancelled Memberships",
        "Members",
        "Member Roles",
        "System",
        "Activity Logs",
        "Security",
        "Login",
        "Settings",
        "Updates",
        "Announcements",
        "Tasks",
        "Messages",
        "Support"
      ),
      allowNull: false,
    },
    adminId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "custom_notifications",
    timestamps: false,
  }
);

module.exports = CustomNotification;