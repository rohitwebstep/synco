const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const AdminHasPermission = sequelize.define("AdminHasPermission", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  adminId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: "admins",
      key: "id",
    },
  },
  permissionId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: "admin_permissions",
      key: "id",
    },
  },
}, {
  tableName: "admin_has_permissions",
  timestamps: true,
});

AdminHasPermission.associate = (models) => {
  AdminHasPermission.belongsTo(models.Admin, { foreignKey: "adminId", as: "admin" });
  AdminHasPermission.belongsTo(models.AdminPermission, { foreignKey: "permissionId", as: "permission" });
};

module.exports = AdminHasPermission;
