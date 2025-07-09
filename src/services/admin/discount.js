const { Discount } = require("../../models");
const { Op } = require("sequelize");

// ✅ Get Discount By Code
exports.getDiscountByCode = async (code) => {
  try {
    const discount = await Discount.findOne({
      where: {
        code: {
          [Op.eq]: code
        }
      }
    });

    if (!discount) {
      return {
        status: false,
        message: `No discount found with code: ${code}`
      };
    }

    return {
      status: true,
      message: "Discount found.",
      data: discount
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getDiscountByCode:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error occurred while fetching discount by code."
    };
  }
};

exports.createDiscount = async (data) => {
  try {
    const discount = await Discount.create({
      type: data.type,
      code: data.code,
      valueType: data.valueType,
      value: data.value,
      applyOncePerOrder: data.applyOncePerOrder,
      limitTotalUses: data.limitTotalUses,
      limitPerCustomer: data.limitPerCustomer,
      startDatetime: data.startDatetime,
      endDatetime: data.endDatetime
    });

    return {
      status: true,
      message: "Discount created successfully.",
      data: discount
    };

  } catch (error) {
    console.error("❌ Sequelize Error in createDiscount:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error occurred while creating the discount."
    };
  }
};