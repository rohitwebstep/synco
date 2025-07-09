// ✅ CONTROLLER FILE (controllers/admin/discount.js)
const discountService = require("../../services/admin/discount");
const { validateFormData } = require("../../utils/validateFormData");

const DEBUG = process.env.DEBUG === "true";

// ✅ Create Discount
exports.createDiscount = async (req, res) => {
  try {
    const formData = req.body;

    if (DEBUG) {
      console.log("🟡 [Step 1] Received request to create discount.");
      console.log("📥 Form Data Received:", JSON.stringify(formData, null, 2));
    }

    const validation = validateFormData(formData, {
      requiredFields: ["type", "code", "valueType", "value", "applyOncePerOrder", "limitTotalUses", "limitPerCustomer", "startDatetime", "endDatetime", "appliesTo"],
      patternValidations: {
        value: "decimal",
        startDatetime: "datetime",
        endDatetime: "datetime",
        limitTotalUses: "number",
        limitPerCustomer: "number"
      }
    });

    if (DEBUG) {
      console.log("🟡 [Step 2] Validation result:", validation);
    }

    if (!validation.isValid) {
      if (DEBUG) console.log("❌ Validation failed:", validation);
      return res.status(400).json({
        status: false,
        error: validation.error,
        message: validation.message,
      });
    }

    if (DEBUG) console.log("✅ [Step 3] Validation passed. Proceeding to service layer.");

    const {
      type,
      code,
      valueType,
      value,
      applyOncePerOrder,
      limitTotalUses,
      limitPerCustomer,
      startDatetime,
      endDatetime,
      appliesTo
    } = formData;

    const discountByCodeResult = await discountService.getDiscountByCode(code);

    if (discountByCodeResult.status) {
      return res.status(500).json({
        status: false,
        message: 'code is already used '
      });
    }

    const discountCreatePayload = {
      type,
      code,
      valueType,
      value,
      applyOncePerOrder,
      limitTotalUses,
      limitPerCustomer,
      startDatetime,
      endDatetime,
    };

    const discountCreateResult = await discountService.createDiscount(discountCreatePayload);

    if (!discountCreateResult.status) {
      return res.status(500).json({
        status: false,
        message: discountCreateResult.message
      });
    }

    const discount = discountCreateResult.data;

    return res.status(500).json({
      status: false,
      message: 'Discount Created Succesffully',
    });
  } catch (error) {
    console.error("❌ Create Discount Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error occurred while creating the discount.",
    });
  }
};
