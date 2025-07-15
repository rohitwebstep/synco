const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const AdminPermission = sequelize.define("AdminPermission", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("allow", "deny"),
    allowNull: false,
    defaultValue: "deny",
  },
}, {
  tableName: "admin_permissions",
  timestamps: true,
});

AdminPermission.associate = (models) => {
  AdminPermission.hasMany(models.AdminHasPermission, { foreignKey: "permissionId", as: "assignedToAdmins" });
};

module.exports = AdminPermission;
