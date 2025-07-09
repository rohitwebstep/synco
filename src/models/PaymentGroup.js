// models/PaymentGroup.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PaymentGroup = sequelize.define("PaymentGroup", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
}, {
  tableName: "payment_groups",
  timestamps: true,
});

module.exports = PaymentGroup;
