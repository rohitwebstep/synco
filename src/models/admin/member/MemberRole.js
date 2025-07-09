const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const MemberRole = sequelize.define(
    "MemberRole",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "member_roles",
        timestamps: true,
    }
);

module.exports = MemberRole;
