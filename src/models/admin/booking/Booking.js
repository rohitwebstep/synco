const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    bookingType: {
      type: DataTypes.ENUM("free", "paid", "removed", "waiting list"),
      allowNull: false,
      defaultValue: "free",
      comment: "free = trial booking, paid = membership booking",
    },

    bookingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // ✅ NEW FIELD — FK → Leads.id
    leadId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "leads", // table name for leads
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Optional lead associated with the booking",
    },

    // ✅ FK → Venues.id
    venueId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "venues",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    // ✅ FK → ClassSchedules.id
    classScheduleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "class_schedules",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    // ✅ FK → PaymentPlans.id
    paymentPlanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "payment_plans",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Selected payment plan for paid bookings",
    },

    trialDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date of trial if bookingType = free",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date of start",
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "attended",
        "not attend",
        "cancelled",
        "rebooked",
        "no_membership",
        "active",
        "frozen",
        "waiting list",
        "request_to_cancel"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    totalStudents: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    interest: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
      comment: "Indicates the level of interest for the booking",
    },

    keyInformation: DataTypes.STRING,
    // ✅ NEW FIELD — FK → Admins.id
    bookedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "admins", // table name for admins
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      comment: "Admin ID who created the booking",
    },
    additionalNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Any extra notes for the booking",
    },
    reasonForNonAttendance: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Any extra notes for the booking",
    },
  },
  {
    tableName: "booking",
    timestamps: true,
  }
);

module.exports = Booking;
