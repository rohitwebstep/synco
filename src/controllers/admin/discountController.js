// ✅ CONTROLLER FILE (controllers/admin/discount.js)
const discountService = require("../../services/admin/discount");
const { validateFormData } = require("../../utils/validateFormData");

const DEBUG = process.env.DEBUG === "true";

// ✅ Create Discount
exports.createDiscount = async (req, res) => {
  try {
    const formData = req.body;

    if (DEBUG) console.log("📥 Received Discount FormData:", formData);

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

    if (!validation.isValid) {
      if (DEBUG) console.log("❌ Validation failed:", validation);
      return res.status(400).json({
        status: false,
        error: validation.error,
        message: validation.message,
      });
    }

    const result = await discountService.createDiscount(formData);

    if (!result.status) {
      if (DEBUG) console.log("❌ Failed to create discount:", result.message);
      return res.status(500).json({
        status: false,
        message: result.message,
      });
    }

    if (DEBUG) console.log("✅ Discount created successfully:", result.data);

    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Create Discount Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error occurred while creating the discount.",
    });
  }
};
