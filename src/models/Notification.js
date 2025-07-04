const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING(255),
    message: DataTypes.TEXT,
    category: {
      type: DataTypes.ENUM("Complaints", "Payments", "Cancelled Memberships"),
      allowNull: false,
    },
    senderId: DataTypes.INTEGER,
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "notifications",
    timestamps: false,
  }
);

module.exports = Notification;
