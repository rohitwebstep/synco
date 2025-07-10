const { Discount, DiscountAppliesTo } = require("../../models");
const { Op } = require("sequelize");

// ✅ Get Discount By Code
const getDiscountByCode = async (code) => {
  try {
    const discount = await Discount.findOne({
      where: { code: { [Op.eq]: code } }
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
      message: error?.parent?.sqlMessage || error?.message || "Error occurred while fetching discount by code."
    };
  }
};

// ✅ Create Discount
const createDiscount = async (data, res) => {
  try {
    const discountByCodeResult = await getDiscountByCode(data.code);
    if (discountByCodeResult.status) {
      return res.status(400).json({
        status: false,
        message: "Code is already used."
      });
    }

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

    if (Array.isArray(data.appliesTo)) {
      for (const item of data.appliesTo) {
        await DiscountAppliesTo.create({
          discountId: discount.id,
          appliesTo: item
        });
      }
    }

    return res.status(201).json({
      status: true,
      message: "Discount created successfully.",
      data: discount
    });
  } catch (error) {
    console.error("❌ Sequelize Error in createDiscount:", error);
    return res.status(500).json({
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error occurred while creating the discount."
    });
  }
};

// ✅ Get existing appliesTo values for a discount
const getDiscountAppliedToByDiscountId = async (discountId) => {
  try {
    const records = await DiscountAppliesTo.findAll({
      where: { discountId },
      attributes: ["appliesTo"]
    });

    return {
      status: true,
      data: records
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getDiscountAppliedToByDiscountId:", error);
    return [];
  }
};

// ✅ Create a new DiscountAppliesTo entry
const createDiscountAppliesTo = async ({ discountId, target }) => {
  try {
    const created = await DiscountAppliesTo.create({
      discountId,
      appliesTo: target
    });

    return {
      status: true,
      message: "Discount target applied successfully.",
      data: created
    };
  } catch (error) {
    console.error("❌ Sequelize Error in createDiscountAppliesTo:", error);
    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error occurred while applying discount target."
    };
  }
};

module.exports = {
  getDiscountByCode,
  createDiscount,
  getDiscountAppliedToByDiscountId,
  createDiscountAppliesTo
};
