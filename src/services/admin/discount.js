const { Discount } = require("../../models");
const { Op } = require("sequelize");

// ✅ Static codes mapping
const staticDiscounts = {
  JASKBKJB: 100,
  JKNDB: 250,
};

// ✅ Create Discount
exports.createDiscount = async (formData) => {
  try {
    const {
      codeType = "discount_code",
      discountCode = "",
      valueType,
      startDate,
      startTime = "00:00:00",
      endDate = null,
      ...rest
    } = formData;

    let upperCode = discountCode?.toUpperCase().trim();
    let finalValue = formData.value;
    let finalValueType = valueType;

    // 🎯 AUTO HANDLE CASES
    if (codeType === "automatic" || codeType === "automatic_code") {
      // If it's automatic, no code required and force 50% off
      upperCode = null;
      finalValue = 50;
      finalValueType = "percentage";
    } else {
      // Check if it's a static discount code
      const isStatic = staticDiscounts.hasOwnProperty(upperCode);
      if (isStatic) {
        finalValue = staticDiscounts[upperCode];
        finalValueType = "fixed_amount";
      }
    }

    const payload = {
      codeType,
      discountCode: upperCode || null,
      value: finalValue,
      valueType: finalValueType,
      startDate,
      startTime,
      endDate,

      // Apply fields from request or defaults
      applyWeeklyClasses: rest.applyWeeklyClasses || false,
      applyJoiningFee: rest.applyJoiningFee || false,
      applyNoRolloLessons: rest.applyNoRolloLessons || false,
      applyUniformFee: rest.applyUniformFee || false,
      applyOneToOne: rest.applyOneToOne || false,
      applyHolidayCamp: rest.applyHolidayCamp || false,
      applyBirthdayParty: rest.applyBirthdayParty || false,

      applyOncePerOrder: rest.applyOncePerOrder || false,
      hasMaxTotalUses: rest.hasMaxTotalUses || false,
      maxTotalUses: rest.maxTotalUses || null,
      limitOnePerCustomer: rest.limitOnePerCustomer || false,
    };

    const discount = await Discount.create(payload);

    return {
      status: true,
      message:
        codeType === "automatic" || codeType === "automatic_code"
          ? `Automatic 50% discount created.`
          : staticDiscounts[upperCode]
          ? `Static coupon "${upperCode}" added with ₹${finalValue} off.`
          : "Discount created successfully.",
      data: discount,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in createDiscount:", error);
    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to create discount.",
    };
  }
};

// ✅ Get All Discounts
exports.getAllDiscounts = async () => {
  try {
    const discounts = await Discount.findAll({
      order: [["createdAt", "DESC"]],
    });
    return {
      status: true,
      message: `Fetched ${discounts.length} discount(s) successfully.`,
      data: discounts,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getAllDiscounts:", error);
    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to fetch discounts.",
    };
  }
};

// ✅ Get Discount By ID
exports.getDiscountById = async (id) => {
  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return { status: false, message: "Discount not found." };
    }
    return { status: true, message: "Discount found.", data: discount };
  } catch (error) {
    console.error("❌ Sequelize Error in getDiscountById:", error);
    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error occurred while fetching discount.",
    };
  }
};

// ✅ Update Discount
exports.updateDiscount = async (id, updateData) => {
  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return { status: false, message: "Discount not found." };
    }
    await discount.update(updateData);
    return {
      status: true,
      message: "Discount updated successfully.",
      data: discount,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in updateDiscount:", error);
    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to update discount.",
    };
  }
};

// ✅ Delete Discount
exports.deleteDiscount = async (id) => {
  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return { status: false, message: "Discount not found." };
    }
    await discount.destroy();
    return { status: true, message: "Discount deleted successfully." };
  } catch (error) {
    console.error("❌ Sequelize Error in deleteDiscount:", error);
    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to delete discount.",
    };
  }
};

// ✅ Apply Static Coupon Code
exports.getDiscountAmountByCode = async (code) => {
  try {
    const upperCode = code.toUpperCase();

    if (!staticDiscounts[upperCode]) {
      return { status: false, message: "Invalid or expired discount code." };
    }

    return {
      status: true,
      data: {
        code: upperCode,
        discountAmount: staticDiscounts[upperCode],
        message: `Coupon "${upperCode}" applied. You get ₹${staticDiscounts[upperCode]} off.`,
      },
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getDiscountAmountByCode:", error);
    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error applying discount code.",
    };
  }
};
