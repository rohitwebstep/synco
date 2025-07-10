const paymentGroupModel = require("../../../services/admin/payment/paymentGroup");
const groupPlanService = require("../../../services/admin/payment/paymentGroupHasPlan");
const { PaymentPlan } = require("../../../models");

const { validateFormData } = require("../../../utils/validateFormData");
const { logActivity } = require("../../../utils/admin/activityLogger");
const { createNotification } = require('../../../utils/admin/notificationHelper');

const DEBUG = process.env.DEBUG === true;
const PANEL = 'admin';
const MODULE = 'payment-group';

// ✅ Create a new payment group
exports.createPaymentGroup = async (req, res) => {
  const formData = req.body;
  const { name, description } = formData;
  let { plans } = formData;

  if (DEBUG) console.log("📥 Creating new payment group with data:", formData);

  const validation = validateFormData(formData, {
    requiredFields: ["name", "description"],
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

  if (typeof plans === "string") {
    plans = plans.split(",").map(id => id.trim()).filter(Boolean);
  }

  try {
    // STEP 1: Create the group
    const result = await paymentGroupModel.createPaymentGroup({ name, description, plans });

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Payment group creation failed:", result.message);
      await logActivity(req, PANEL, MODULE, 'create', result, false);
      return res.status(500).json({
        status: false,
        message: result.message || "Failed to create payment group.",
      });
    }

    const groupId = result.data.id;

    // STEP 2: Remove any existing plans (cleanup)
    const existingPlanResult = await groupPlanService.getPaymentGroupAssignedPlans(groupId);
    const existingPlans = existingPlanResult.status ? existingPlanResult.data : [];
    const newPlanIds = plans.map(String);
    const toRemove = existingPlans.filter(id => !newPlanIds.includes(id));

    for (const planId of toRemove) {
      const removeResult = await groupPlanService.removePlanFromPaymentGroup(groupId, planId);
      if (DEBUG) {
        console.log(
          removeResult.status
            ? `🗑️ Removed plan ID ${planId}`
            : `⚠️ Failed to remove plan ID ${planId}: ${removeResult.message}`
        );
      }
    }

    // STEP 3: Assign new plans
    const assigned = [];
    const skipped = [];

    for (const planId of plans) {
      const planCheck = await PaymentPlan.findByPk(planId);

      if (!planCheck) {
        skipped.push({ planId, reason: "Plan not found" });
        if (DEBUG) console.warn(`⛔ Skipped plan ID ${planId}: not found`);
        continue;
      }

      const assignResult = await groupPlanService.assignPlanToPaymentGroup(groupId, planId);
      if (!assignResult.status) {
        skipped.push({ planId, reason: assignResult.message });
        if (DEBUG) console.warn(`⚠️ Failed to assign plan ID ${planId}: ${assignResult.message}`);
        continue;
      }

      if (DEBUG) console.log(`✅ Assigned plan ID ${planId} to group ${groupId}`);
      assigned.push(assignResult.data);
    }

    if (DEBUG) console.log("✅ Payment group created:", result.data);

    await logActivity(req, PANEL, MODULE, 'create', {
      oneLineMessage: `Created payment group "${name}".`
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
      message: "Server error occurred. Please try again later.",
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
      oneLineMessage: `Fetched ${result.data.length} payment group(s).`,
    }, true);

    return res.status(200).json({
      status: true,
      total: result.data.length,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching payment groups:", error);
    await logActivity(req, PANEL, MODULE, 'list', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error occurred." });
  }
};

// ✅ Get a single payment group by ID
exports.getPaymentGroupById = async (req, res) => {
  const { id } = req.params;

  if (DEBUG) console.log(`🔍 Fetching payment group with ID: ${id}`);

  try {
    const result = await paymentGroupModel.getPaymentGroupById(id);

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Payment group not found:", result.message);
      await logActivity(req, PANEL, MODULE, 'getById', result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Payment group fetched successfully:", result.data);

    await logActivity(req, PANEL, MODULE, 'getById', {
      oneLineMessage: `Fetched payment group ID: ${id}`,
    }, true);

    return res.status(200).json({
      status: true,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching payment group:", error);
    await logActivity(req, PANEL, MODULE, 'getById', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error occurred." });
  }
};

// ✅ Update an existing payment group
exports.updatePaymentGroup = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const { name, description } = formData;
  let { plans } = formData;

  if (DEBUG) console.log(`✏️ Updating payment group ID: ${id} with data:`, formData);

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

  // ✅ Parse plan IDs
  if (typeof plans === "string") {
    plans = plans.split(",").map(id => id.trim()).filter(Boolean);
  }

  try {
    // ✅ Step 1: Update group basic info
    const result = await paymentGroupModel.updatePaymentGroup(id, { name, description });

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Failed to update payment group:", result.message);
      await logActivity(req, PANEL, MODULE, 'update', result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    // ✅ Step 2: If plans are sent, handle plan re-assignment
    if (Array.isArray(plans)) {
      const existingPlanResult = await groupPlanService.getPaymentGroupAssignedPlans(id);
      const existingPlans = existingPlanResult.status ? existingPlanResult.data : [];
      const newPlanIds = plans.map(String);

      // Remove unselected plans
      const toRemove = existingPlans.filter(id => !newPlanIds.includes(id));
      for (const planId of toRemove) {
        const removeResult = await groupPlanService.removePlanFromPaymentGroup(id, planId);
        if (DEBUG) {
          console.log(
            removeResult.status
              ? `🗑️ Removed plan ID ${planId}`
              : `⚠️ Failed to remove plan ID ${planId}: ${removeResult.message}`
          );
        }
      }

      // Add new plans
      for (const planId of newPlanIds) {
        const planCheck = await PaymentPlan.findByPk(planId);

        if (!planCheck) {
          if (DEBUG) console.warn(`⛔ Skipped plan ID ${planId}: not found`);
          continue;
        }

        const assignResult = await groupPlanService.assignPlanToPaymentGroup(id, planId);

        if (!assignResult.status) {
          if (DEBUG) console.warn(`⚠️ Failed to assign plan ID ${planId}: ${assignResult.message}`);
          continue;
        }

        if (DEBUG) console.log(`✅ Assigned plan ID ${planId} to group ${id}`);
      }
    }

    if (DEBUG) console.log("✅ Payment group updated successfully:", result.data);

    await logActivity(req, PANEL, MODULE, 'update', {
      oneLineMessage: `Updated payment group ID: ${id}`,
    }, true);

    return res.status(200).json({
      status: true,
      message: "Payment group updated successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error updating payment group:", error);
    await logActivity(req, PANEL, MODULE, 'update', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error occurred." });
  }
};

// ✅ Delete a payment group
exports.deletePaymentGroup = async (req, res) => {
  const { id } = req.params;

  if (DEBUG) console.log(`🗑️ Deleting payment group ID: ${id}`);

  try {
    const result = await paymentGroupModel.deletePaymentGroup(id);

    if (!result.status) {
      if (DEBUG) console.warn("⚠️ Failed to delete payment group:", result.message);
      await logActivity(req, PANEL, MODULE, 'delete', result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Payment group deleted.");

    await logActivity(req, PANEL, MODULE, 'delete', {
      oneLineMessage: `Deleted payment group ID: ${id}`,
    }, true);

    return res.status(200).json({
      status: true,
      message: "Payment group deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting payment group:", error);
    await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: error.message }, false);
    return res.status(500).json({ status: false, message: "Server error occurred." });
  }
};
