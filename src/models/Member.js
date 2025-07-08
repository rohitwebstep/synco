const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Member = sequelize.define(
  "Member",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true, // Optional image path
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    passwordHint: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Masked version of original password for admin reference (e.g., Ro****ia)",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: "member_roles", // Must match the tableName of Role model
        key: "id",
      },
    },
    resetOtp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    resetOtpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspend"),
      defaultValue: "active",
    }
  },
  {
    tableName: "members",
    timestamps: true,
  }
);

module.exports = Member;
