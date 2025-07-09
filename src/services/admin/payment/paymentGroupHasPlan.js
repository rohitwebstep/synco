const PaymentGroupHasPlan = require("../../../models/admin/payment/PaymentGroupHasPlan");

// ✅ Assign a plan to a group (ensures uniqueness)
exports.assignPlanToPaymentGroup = async (groupId, planId) => {
  try {
    // Remove any existing link before assigning (idempotent)
    await PaymentGroupHasPlan.destroy({
      where: {
        payment_group_id: groupId,
        payment_plan_id: planId,
      },
    });

    const created = await PaymentGroupHasPlan.create({
      payment_group_id: groupId,
      payment_plan_id: planId,
    });

    return {
      status: true,
      data: created,
      message: `Plan ID ${planId} successfully assigned to Group ID ${groupId}.`,
    };
  } catch (error) {
    return {
      status: false,
      message: "Failed to assign plan to group.",
      error: error.message,
    };
  }
};

// ✅ Remove a plan from a group
exports.removePlanFromPaymentGroup = async (groupId, planId) => {
  try {
    const deletedCount = await PaymentGroupHasPlan.destroy({
      where: {
        payment_group_id: groupId,
        payment_plan_id: planId,
      },
    });

    if (deletedCount === 0) {
      return {
        status: false,
        message: `No matching plan (ID: ${planId}) found for group (ID: ${groupId}).`,
      };
    }

    return {
      status: true,
      message: `Plan ID ${planId} removed from Group ID ${groupId} successfully.`,
    };
  } catch (error) {
    console.error("❌ removePlanFromGroup error:", error);
    return {
      status: false,
      message: "Failed to remove plan from group.",
      error: error.message,
    };
  }
};

// ✅ Get all assigned plan IDs for a group
exports.getPaymentGroupAssignedPlans = async (groupId) => {
  try {
    const plans = await PaymentGroupHasPlan.findAll({
      where: { payment_group_id: groupId },
      attributes: ["payment_plan_id"],
    });

    const planIds = plans.map(p => String(p.payment_plan_id));

    return {
      status: true,
      data: planIds,
      message: `${planIds.length} plan(s) assigned to Group ID ${groupId}.`,
    };
  } catch (error) {
    console.error("❌ getAssignedPlans error:", error);
    return {
      status: false,
      message: "Failed to fetch assigned plans.",
      error: error.message,
    };
  }
};
