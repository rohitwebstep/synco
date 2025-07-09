const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");
const Discount = require("./Discount"); // Adjust path if needed
const Member = require("../member/Member"); // Adjust path if needed

const DiscountUsage = sequelize.define(
    "DiscountUsage",
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
            comment: "Reference to discounts table",
            references: {
                model: Discount,
                key: "id"
            },
            onDelete: "CASCADE"
        },
        memberId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: "member_id",
            comment: "Reference to members table",
            references: {
                model: Member,
                key: "id"
            },
            onDelete: "CASCADE"
        },
        usedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "used_at",
            defaultValue: DataTypes.NOW,
            comment: "When the discount was used"
        }
    },
    {
        tableName: "discount_usages",
        timestamps: false,
        comment: "Tracks when a customer uses a discount"
    }
);

module.exports = DiscountUsage;
