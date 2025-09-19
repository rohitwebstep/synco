const { SessionExercise } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create
exports.createSessionExercise = async (data) => {
  try {
    const exercise = await SessionExercise.create(data);
    return { status: true, data: exercise.get({ plain: true }) };
  } catch (error) {
    console.error("❌ Error creating exercise:", error);
    return { status: false, message: error.message };
  }
};

// Get All
exports.getAllSessionExercises = async (adminId) => {
  try {
    const exercises = await SessionExercise.findAll({
      where: { createdBy: adminId },
      order: [["createdAt", "DESC"]],
    });

    return { status: true, data: exercises };
  } catch (error) {
    console.error("❌ Error fetching exercises:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Get by ID
exports.getSessionExerciseById = async (id, adminId) => {
  try {
    const exercise = await SessionExercise.findOne({
      where: { id, createdBy: adminId },
    });

    if (!exercise) {
      return { status: false, message: "Exercise not found or unauthorized." };
    }

    return { status: true, data: exercise };
  } catch (error) {
    console.error("❌ Error fetching exercise by ID:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Update
exports.updateSessionExercise = async (id, data, adminId) => {
  try {
    const exercise = await SessionExercise.findOne({
      where: { id, createdBy: adminId },
    });

    if (!exercise) {
      return { status: false, message: "Exercise not found or unauthorized" };
    }

    await exercise.update(data);
    return { status: true, data: exercise };
  } catch (error) {
    console.error("❌ Error updating exercise:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Delete
exports.deleteSessionExercise = async (id, adminId) => {
  try {
    const exercise = await SessionExercise.findOne({
      where: {
        id,
        createdBy: adminId, // ensure only creator can delete
      },
    });

    if (!exercise) {
      return { status: false, message: "Exercise not found or unauthorized" };
    }

    await exercise.destroy();
    return { status: true, message: "Exercise deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting exercise:", error);
    return { status: false, message: error.message };
  }
};
