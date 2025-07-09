// ✅ CONTROLLER FILE (controllers/admin/discount.js)
const discountService = require("../../services/admin/discount");
const { validateFormData } = require("../../utils/validateFormData");

const DEBUG = process.env.DEBUG === "true";

// ✅ Create Discount
exports.create = async (req, res) => {
  try {
    const formData = req.body;

    if (DEBUG) console.log("📥 Received Discount FormData:", formData);

    const validation = validateFormData(formData, {
      requiredFields: ["codeType", "valueType", "startDate"],
      patternValidations: {
        value: "decimal",
      },
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

// ✅ Get All Discounts
exports.getAll = async (req, res) => {
  try {
    const result = await discountService.getAllDiscounts();

    if (!result.status) {
      if (DEBUG) console.log("❌ Failed to fetch discounts:", result.message);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log(`✅ Retrieved ${result.data.length} discount(s)`);

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Get All Discounts Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch discounts. Please try again later.",
    });
  }
};

// ✅ Get Discount By ID
exports.getById = async (req, res) => {
  const { id } = req.params;
  if (DEBUG) console.log("🔎 Fetching discount ID:", id);

  try {
    const result = await discountService.getDiscountById(id);

    if (!result.status) {
      if (DEBUG) console.log("❌ Discount not found:", id);
      return res.status(404).json({ status: false, message: result.message });
    }

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Get Discount By ID Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch discount. Please try again later.",
    });
  }
};

// ✅ Update Discount
exports.update = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (DEBUG) console.log("✏️ Updating discount ID:", id, updateData);

  const validation = validateFormData(updateData, {
    requiredFields: ["codeType", "valueType", "startDate"],
    patternValidations: {
      value: "decimal",
    },
  });

  if (!validation.isValid) {
    if (DEBUG) console.log("❌ Validation failed:", validation);
    return res.status(400).json({
      status: false,
      error: validation.error,
      message: validation.message,
    });
  }

  try {
    const result = await discountService.updateDiscount(id, updateData);

    if (!result.status) {
      if (DEBUG) console.log("❌ Failed to update discount:", result.message);
      return res.status(404).json({ status: false, message: result.message });
    }

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Update Discount Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update discount. Please try again later.",
    });
  }
};

// ✅ Delete Discount
exports.remove = async (req, res) => {
  const { id } = req.params;
  if (DEBUG) console.log("🗑️ Deleting discount ID:", id);

  try {
    const result = await discountService.deleteDiscount(id);

    if (!result.status) {
      if (DEBUG) console.log("❌ Failed to delete discount:", result.message);
      return res.status(404).json({ status: false, message: result.message });
    }

    return res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Delete Discount Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete discount. Please try again later.",
    });
  }
};

// ✅ Apply Discount Code
exports.getDiscountAmount = async (req, res) => {
  const { code } = req.body;

  if (DEBUG) console.log("🏷️ Applying coupon code:", code);

  if (!code) {
    return res.status(400).json({
      status: false,
      message: "Coupon code is required.",
    });
  }

  try {
    const result = await discountService.getDiscountAmountByCode(code);

    if (!result.status) {
      return res.status(404).json({ status: false, message: result.message });
    }

    return res.status(200).json({ status: true, data: result.data });
  } catch (error) {
    console.error("❌ Apply Discount Code Error:", error);
    return res.status(500).json({
      status: false,
      message: "Error applying discount code.",
    });
  }
};
