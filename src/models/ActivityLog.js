const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admins",
        key: "id",
      },
    },

    method: { type: DataTypes.STRING(10), allowNull: false },
    route: { type: DataTypes.STRING(255), allowNull: false },
    ip: { type: DataTypes.STRING(100), allowNull: false },
    userAgent: { type: DataTypes.TEXT, allowNull: false },

    location: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Location info: latitude, longitude, city, region, country, timezone",
    },
    ispInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "ISP info: isp, organization, as, proxy",
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Device info: device_type, browser_name, os",
    },
  },
  {
    tableName: "activity_logs",
    timestamps: true,
  }
);

module.exports = ActivityLog;
