const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Admin = sequelize.define(
  "Admin",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING(100),
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: DataTypes.STRING(255),
    resetOtp: DataTypes.STRING(10),
    resetOtpExpiry: DataTypes.DATE,
  },
  {
    tableName: "admins",
    timestamps: true,
  }
);

module.exports = Admin;
