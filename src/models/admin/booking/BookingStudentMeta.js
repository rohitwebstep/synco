const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const BookingStudentMeta = sequelize.define(
  "BookingStudentMeta",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    bookingTrialId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "booking",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    studentFirstName: DataTypes.STRING,
    studentLastName: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    age: DataTypes.INTEGER.UNSIGNED,
    gender: DataTypes.STRING,
    medicalInformation: DataTypes.STRING,
  },
  {
    tableName: "booking_student_meta", // 👈 custom table name
    timestamps: true,
  }
);

BookingStudentMeta.associate = (models) => {
  BookingStudentMeta.belongsTo(models.Booking, {
    foreignKey: "bookingTrialId",
    as: "booking",
  });

  BookingStudentMeta.hasMany(models.BookingParentMeta, {
    foreignKey: "studentId",
    as: "parents",
  });

  BookingStudentMeta.hasMany(models.BookingEmergencyMeta, {
    foreignKey: "studentId",
    as: "emergencyContacts",
  });
};

module.exports = BookingStudentMeta;
