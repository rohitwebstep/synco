// models/MemberPermission.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const MemberPermission = sequelize.define(
    "MemberPermission",
    {
        id: {
            type: DataTypes.INTEGER,
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
    },
    {
        tableName: "member_permissions",
        timestamps: true,
    }
);

module.exports = MemberPermission;
