const PaymentPlan = require("../../../models/admin/payment/PaymentPlan");
const { Op } = require("sequelize");

// ✅ Create a new payment plan
exports.createPlan = async (data) => {
  try {
    const plan = await PaymentPlan.create(data);
    return {
      status: true,
      data: plan,
      message: "Payment plan created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to create payment plan. ${error.message}`,
    };
  }
};

// ✅ Get all payment plans
exports.getAllPlans = async () => {
  try {
    const plans = await PaymentPlan.findAll({
      order: [["createdAt", "DESC"]],
    });

    return {
      status: true,
      data: plans,
      message: `${plans.length} payment plan(s) found.`,
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to fetch payment plans. ${error.message}`,
    };
  }
};

// ✅ Get payment plan by ID
exports.getPlanById = async (id) => {
  try {
    const plan = await PaymentPlan.findByPk(id);

    if (!plan) {
      return {
        status: false,
        message: "No payment plan found with the provided ID.",
      };
    }

    return {
      status: true,
      data: plan,
      message: "Payment plan retrieved successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Error fetching payment plan. ${error.message}`,
    };
  }
};

// ✅ Update a payment plan
exports.updatePlan = async (id, data) => {
  try {
    const plan = await PaymentPlan.findByPk(id);

    if (!plan) {
      return {
        status: false,
        message: "Cannot update. Payment plan not found.",
      };
    }

    await plan.update(data);

    return {
      status: true,
      data: plan,
      message: "Payment plan updated successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to update payment plan. ${error.message}`,
    };
  }
};

// ✅ Delete a payment plan
exports.deletePlan = async (id) => {
  try {
    const plan = await PaymentPlan.findByPk(id);

    if (!plan) {
      return {
        status: false,
        message: "Cannot delete. Payment plan not found.",
      };
    }

    await plan.destroy();

    return {
      status: true,
      message: "Payment plan deleted successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to delete payment plan. ${error.message}`,
    };
  }
};
