// models/CustomNotificationRead.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const CustomNotificationRead = sequelize.define(
  "CustomNotificationRead",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customNotificationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    memberId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "members",
        key: "id",
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "custom_notification_reads",
    timestamps: false,
  }
);

module.exports = CustomNotificationRead;
