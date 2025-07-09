// models/MemberHasPermission.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const MemberHasPermission = sequelize.define(
  "MemberHasPermission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    memberId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "members",
        key: "id",
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "member_permissions",
        key: "id",
      },
    },
  },
  {
    tableName: "member_has_permissions",
    timestamps: true,
  }
);

module.exports = MemberHasPermission;
