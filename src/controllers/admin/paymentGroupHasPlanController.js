const paymentGroupModel = require("../../services/admin/paymentGroup");
const groupPlanService = require("../../services/admin/paymentGroupHasPlan");
const { logActivity } = require("../../utils/admin/activityLogger");
const PaymentPlan = require("../../services/admin/paymentPlan");
const { validateFormData } = require("../../utils/validateFormData");

const DEBUG = process.env.DEBUG === "true";
const PANEL = 'admin';
const MODULE = 'payment-group';

exports.assignPlansToPaymentGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const formData = req.body;
  let { planIds } = formData;

  if (DEBUG) {
    console.log("📥 STEP 1: Received request to assign plans");
    console.log("📝 Request Body:", formData);
  }

  // STEP 2: Validate group existence
  const groupResult = await paymentGroupModel.getPaymentGroupById(groupId);

  if (!groupResult.status) {
    const message = groupResult.message || "Group not found.";
    if (DEBUG) {
      console.log("❌ STEP 2: Group does not exist");
      console.log(`🔎 Group ID: ${groupId} not found`);
    }
    await logActivity(req, PANEL, MODULE, 'assignPlans', { oneLineMessage: message }, false);
    return res.status(404).json({ status: false, message });
  }

  if (DEBUG) {
    console.log("✅ STEP 2: Group found");
    console.log("🏷️ Group:", groupResult.data.name || groupId);
  }

  // STEP 3: Validate input
  const validation = validateFormData(formData, {
    requiredFields: ["planIds"],
  });

  if (!validation.isValid) {
    if (DEBUG) {
      console.log("❌ STEP 3: Validation failed");
      console.log("🚫 Validation Error:", validation.error);
    }
    await logActivity(req, PANEL, MODULE, 'assignPlans', validation.error, false);
    return res.status(400).json({
      status: false,
      error: validation.error,
      message: validation.message,
    });
  }

  // STEP 4: Normalize planIds
  if (typeof planIds === "string") {
    planIds = planIds.split(",").map(id => id.trim()).filter(Boolean);
  }

  if (!Array.isArray(planIds) || planIds.length === 0) {
    const message = "planIds must be a non-empty array.";
    if (DEBUG) console.log("❌ STEP 4:", message);
    await logActivity(req, PANEL, MODULE, 'assignPlans', { oneLineMessage: message }, false);
    return res.status(400).json({ status: false, message });
  }

  if (DEBUG) {
    console.log("✅ STEP 4: Normalized planIds");
    console.log("📦 Plan IDs:", planIds);
  }

  try {
    // STEP 5: Fetch current assigned plans
    const existingPlanResult = await groupPlanService.getPaymentGroupAssignedPlans(groupId);

    if (!existingPlanResult.status) {
      if (DEBUG) {
        console.log("❌ STEP 5: Failed to fetch assigned plans");
        console.log("⚠️ Error:", existingPlanResult.message);
      }
      await logActivity(req, PANEL, MODULE, 'assignPlans', existingPlanResult, false);
      return res.status(500).json({
        status: false,
        message: "Failed to fetch existing plan assignments.",
      });
    }

    const existingPlanIds = existingPlanResult.data;
    const newPlanIds = planIds.map(String);
    const toRemove = existingPlanIds.filter(id => !newPlanIds.includes(id));

    if (DEBUG) {
      console.log("📂 STEP 5: Plan comparison complete");
      console.log("🟡 Existing:", existingPlanIds);
      console.log("🟢 Incoming:", newPlanIds);
      console.log("🔴 To Remove:", toRemove);
    }

    // STEP 6: Remove old plans
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

    // STEP 7: Assign new plans
    const assigned = [];
    const skipped = [];

    for (const planId of planIds) {
      const planCheck = await PaymentPlan.getPlanById(planId);

      if (!planCheck.status) {
        skipped.push({ planId, reason: "Plan does not exist" });
        if (DEBUG) console.log(`⛔ Skipped plan ID ${planId}: Plan not found`);
        continue;
      }

      const assignResult = await groupPlanService.assignPlanToPaymentGroup(groupId, planId);

      if (!assignResult.status) {
        skipped.push({ planId, reason: assignResult.message });
        if (DEBUG) console.log(`⚠️ Failed to assign plan ID ${planId}: ${assignResult.message}`);
        continue;
      }

      if (DEBUG) console.log(`✅ Assigned plan ID ${planId} to group ${groupId}`);
      assigned.push(assignResult.data);
    }

    // STEP 8: Final Summary
    const summary = {
      oneLineMessage: `Assigned ${assigned.length} plan(s) to group ${groupId}.`,
      assigned: assigned.map(r => r.payment_plan_id),
      removed: toRemove,
      skipped,
    };

    if (DEBUG) {
      console.log("📊 STEP 8: Summary of Assignment");
      console.log("🟢 Assigned:", summary.assigned);
      console.log("🔴 Removed:", summary.removed);
      if (skipped.length > 0) console.log("⚠️ Skipped:", skipped);
    }

    await logActivity(req, PANEL, MODULE, 'assignPlans', summary, true);

    return res.status(200).json({
      status: true,
      message: "Plan assignment process completed.",
      assigned,
      removed: toRemove,
      skipped: skipped.length ? skipped : undefined,
    });

  } catch (error) {
    console.error("❌ STEP 9: Unexpected server error", error);
    await logActivity(req, PANEL, MODULE, 'assignPlans', { oneLineMessage: error.message }, false);
    return res.status(500).json({
      status: false,
      message: "Server error while assigning plans.",
    });
  }
};
