const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NotificationRecipient = sequelize.define(
  "NotificationRecipient",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    notificationId: {
      type: DataTypes.INTEGER,
      references: { model: "notifications", key: "id" },
    },
    recipientId: {
      type: DataTypes.INTEGER,
      references: { model: "admins", key: "id" },
    },
    readAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "notification_recipients",
    timestamps: false,
  }
);

module.exports = NotificationRecipient;
