const { PaymentGroup, PaymentPlan } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create a group
exports.createPaymentGroup = async ({ name, description, createdBy }) => {
  try {
    const group = await PaymentGroup.create({
      name,
      description,
      createdBy,
    });

    return {
      status: true,
      data: group,
      message: "Payment group created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Unable to create payment group. ${error.message}`,
    };
  }
};

exports.getAllPaymentGroups = async (adminId) => {
  try {
    const groups = await PaymentGroup.findAll({
      where: { createdBy: adminId },
      include: [
        {
          model: PaymentPlan,
          as: "paymentPlans",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      status: true,
      message: "Payment groups fetched successfully",
      data: groups,
    };
  } catch (error) {
    console.error("❌ Error in getAllPaymentGroups:", error);
    return {
      status: false,
      message: "Failed to fetch payment groups",
      error,
    };
  }
};

exports.getPaymentGroupById = async (id, adminId) => {
  try {
    const group = await PaymentGroup.findOne({
      where: { id, createdBy: adminId },
      include: [
        {
          model: PaymentPlan,
          as: "paymentPlans",
        },
      ],
    });

    if (!group) {
      return {
        status: false,
        message: "Payment group not found",
      };
    }

    return {
      status: true,
      message: "Payment group fetched successfully",
      data: group,
    };
  } catch (error) {
    console.error("❌ Error in getPaymentGroupById:", error);
    return {
      status: false,
      message: "Failed to fetch payment group",
      error,
    };
  }
};

// ✅ Update a payment group by ID and createdBy
exports.updatePaymentGroup = async (id, createdBy, { name, description }) => {
  try {
    if (!id || !createdBy) {
      return {
        status: false,
        message: "Missing payment group ID or admin ID (createdBy).",
      };
    }

    const group = await PaymentGroup.findOne({
      where: { id, createdBy },
    });

    if (!group) {
      return {
        status: false,
        message: "Cannot update. Payment group not found.",
      };
    }

    await group.update({ name, description });

    return {
      status: true,
      data: group,
      message: "Payment group updated successfully.",
    };
  } catch (error) {
    console.error("❌ Error updating payment group:", error);
    return {
      status: false,
      message: `Failed to update payment group. ${error.message}`,
    };
  }
};

// ✅ Delete a group by ID and createdBy
exports.deletePaymentGroup = async (id, createdBy) => {
  try {
    const group = await PaymentGroup.findOne({
      where: { id, createdBy },
    });

    if (!group) {
      return {
        status: false,
        message: "Cannot delete. Payment group not found.",
      };
    }

    await group.destroy();

    return {
      status: true,
      message: "Payment group deleted successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to delete group. ${error.message}`,
    };
  }
};
