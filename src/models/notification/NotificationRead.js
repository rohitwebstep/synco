const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const NotificationRead = sequelize.define(
  "NotificationRead",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    notificationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ✅ allow null
      references: {
        model: "admins",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notification_reads",
    timestamps: false,
  }
);

module.exports = NotificationRead;
