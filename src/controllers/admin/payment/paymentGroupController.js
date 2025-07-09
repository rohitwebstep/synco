const paymentGroupModel = require("../../../services/admin/payment/paymentGroup");
const { validateFormData } = require("../../../utils/validateFormData");
const { logActivity } = require("../../../utils/admin/activityLogger");

const DEBUG = process.env.DEBUG === "true";
const PANEL = 'admin';
const MODULE = 'payment-group';

// ✅ Create a new payment group
exports.createPaymentGroup = async (req, res) => {
  const formData = req.body;
  const { name, description } = formData;

  if (DEBUG) console.log("📥 Creating new payment group with data:", formData);

  const validation = validateFormData(formData, {
    requiredFields: ["name", "description"]
  });

  if (!validation.isValid) {
    if (DEBUG) console.log("❌ Validation failed:", validation.error);
    await logActivity(req, PANEL, MODULE, 'create', validation.error, false);
    return res.status(400).json({
      status: false,
      error: validation.error,
      message: validation.message,
    });
  }

  try {
    const result = await paymentGroupModel.createPaymentGroup({ name, description });

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Payment group creation failed:", result.message);
      await logActivity(req, PANEL, MODULE, 'create', result, false);
      return res.status(500).json({
        status: false,
        message: result.message || "Failed to create payment group.",
      });
    }

    if (DEBUG) console.log("✅ Payment group created successfully:", result.data);
    await logActivity(req, PANEL, MODULE, 'create', {
      oneLineMessage: `Created payment group "${name}".`,
    }, true);

    return res.status(201).json({
      status: true,
      message: "Payment group created successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error creating payment group:", error);
    await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: error.message }, false);
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ✅ Get all payment groups
exports.getAllPaymentGroups = async (req, res) => {
  if (DEBUG) console.log("📥 Fetching all payment groups...");

  try {
    const result = await paymentGroupModel.getAllPaymentGroups();

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Failed to fetch groups:", result.message);
      await logActivity(req, PANEL, MODULE, 'list', result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log(`📦 Total groups fetched: ${result.data.length}`);
    await logActivity(req, PANEL, MODULE, 'list', {
      oneLineMessage: `Fetched ${result.data.length} payment group(s).`
    }, true);

    return res.status(200).json({
      status: true,
      total: result.data.length,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    await logActivity(req, PANEL, MODULE, 'list', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ Get group by ID
exports.getPaymentGroupById = async (req, res) => {
  const { id } = req.params;

  if (DEBUG) console.log(`🔍 Fetching group with ID: ${id}`);

  try {
    const result = await paymentGroupModel.getPaymentGroupById(id);

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Group not found:", result.message);
      await logActivity(req, PANEL, MODULE, 'getById', result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Group fetched successfully:", result.data);
    await logActivity(req, PANEL, MODULE, 'getById', {
      oneLineMessage: `Fetched payment group ID: ${id}`
    }, true);

    return res.status(200).json({
      status: true,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching group:", error);
    await logActivity(req, PANEL, MODULE, 'getById', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ Update group
exports.updatePaymentGroup = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const { name, description } = formData;

  if (DEBUG) console.log(`✏️ Updating group ID: ${id} with data:`, formData);

  const validation = validateFormData(formData, {
    requiredFields: ["name", "description"]
  });

  if (!validation.isValid) {
    if (DEBUG) console.log("❌ Validation failed:", validation.error);
    await logActivity(req, PANEL, MODULE, 'update', validation.error, false);
    return res.status(400).json({
      status: false,
      error: validation.error,
      message: validation.message,
    });
  }

  try {
    const result = await paymentGroupModel.updatePaymentGroup(id, { name, description });

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Failed to update group:", result.message);
      await logActivity(req, PANEL, MODULE, 'update', result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Group updated successfully:", result.data);
    await logActivity(req, PANEL, MODULE, 'update', {
      oneLineMessage: `Updated payment group ID: ${id}`
    }, true);

    return res.status(200).json({
      status: true,
      message: "Payment group updated successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error updating group:", error);
    await logActivity(req, PANEL, MODULE, 'update', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ Delete group
exports.deletePaymentGroup = async (req, res) => {
  const { id } = req.params;

  if (DEBUG) console.log(`🗑️ Deleting payment group ID: ${id}`);

  try {
    const result = await paymentGroupModel.deletePaymentGroup(id);

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Failed to delete group:", result.message);
      await logActivity(req, PANEL, MODULE, 'delete', result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Group deleted successfully.");
    await logActivity(req, PANEL, MODULE, 'delete', {
      oneLineMessage: `Deleted payment group ID: ${id}`
    }, true);

    return res.status(200).json({
      status: true,
      message: "Payment group deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting group:", error);
    await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
