const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");
const Discount = require("./Discount"); // Adjust path if needed

const DiscountAppliesTo = sequelize.define(
    "DiscountAppliesTo",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "Primary key"
        },
        discountId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: "discount_id",
            comment: "Foreign key to discounts table",
            references: {
                model: Discount,
                key: "id"
            },
            onDelete: "CASCADE"
        },
        target: {
            type: DataTypes.ENUM(
                'weekly_classes',
                'joining_fee',
                'no_roto_lessons',
                'uniform_fee',
                'one_to_one',
                'holiday_camp',
                'birthday_party'
            ),
            allowNull: false,
            comment: "Area of application for the discount"
        }
    },
    {
        tableName: "discount_applies_to",
        timestamps: false,
        comment: "Mapping of discounts to specific services they apply to"
    }
);

module.exports = DiscountAppliesTo;
