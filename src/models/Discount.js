const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Discount = sequelize.define(
  "Discount",
  {
    codeType: {
      type: DataTypes.ENUM("discount_code", "automatic"),
      allowNull: false,
      defaultValue: "discount_code",
    },
    discountCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    valueType: {
      type: DataTypes.ENUM("percentage", "fixed_amount"),
      allowNull: false,
      defaultValue: "percentage",
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // Apply to checkboxes
    applyWeeklyClasses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyJoiningFee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyNoRolloLessons: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyUniformFee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyOneToOne: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyHolidayCamp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyBirthdayParty: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Usage limits
    applyOncePerOrder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasMaxTotalUses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    maxTotalUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    limitOnePerCustomer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Active period
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "discounts",
  }
);

module.exports = Discount;
