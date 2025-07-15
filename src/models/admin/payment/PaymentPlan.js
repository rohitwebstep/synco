const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const PaymentPlan = sequelize.define("PaymentPlan", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  interval: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  students: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  joiningFee: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  HolidayCampPackage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  termsAndCondition: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
},
  {
    tableName: "payment_plans",
    timestamps: true,
  }
);

// ✅ Association
PaymentPlan.associate = (models) => {
  PaymentPlan.belongsToMany(models.PaymentGroup, {
    through: models.PaymentGroupHasPlan,
    foreignKey: "payment_plan_id",
    otherKey: "payment_group_id",
    as: "paymentGroups",
  });
};

module.exports = PaymentPlan;
