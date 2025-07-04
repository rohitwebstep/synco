const { Admin } = require("../../models");
const { Op } = require("sequelize");

// Create admin
exports.createAdmin = async (name, email, password) => {
  try {
    const admin = await Admin.create({ name, email, password });

    return {
      status: true,
      message: "Admin created successfully.",
      data: { id: admin.id },
    };
  } catch (error) {
    console.error("❌ Sequelize Error in createAdmin:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Failed to create admin.",
    };
  }
};

// Find admin by email
exports.findAdminByEmail = async (email) => {
  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return {
        status: false,
        message: "Admin not found with this email.",
      };
    }

    return {
      status: true,
      message: "Admin found.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in findAdminByEmail:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error occurred while finding admin.",
    };
  }
};

// Get admin by ID
exports.getAdminById = async (id) => {
  try {
    const admin = await Admin.findOne({
      where: { id },
      attributes: { exclude: ["password", "resetOtp", "resetOtpExpiry"] },
    });

    if (!admin) {
      return {
        status: false,
        message: "Admin not found by ID.",
      };
    }

    return {
      status: true,
      message: "Admin found.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getAdminById:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error occurred while fetching admin.",
    };
  }
};

// Update password by admin ID
exports.updatePasswordById = async (id, newPassword) => {
  try {
    const result = await Admin.update({ password: newPassword }, { where: { id } });

    if (result[0] === 0) {
      return {
        status: false,
        message: "No admin updated. ID may be incorrect.",
      };
    }

    return {
      status: true,
      message: "Password updated successfully.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in updatePasswordById:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error updating password.",
    };
  }
};

// Save OTP to admin record
exports.saveOtpToAdmin = async (adminId, otp, expiry) => {
  try {
    const result = await Admin.update(
      {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
      {
        where: { id: adminId },
      }
    );

    if (result[0] === 0) {
      return {
        status: false,
        message: "Failed to save OTP. Admin not found.",
      };
    }

    return {
      status: true,
      message: "OTP saved successfully.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in saveOtpToAdmin:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error saving OTP.",
    };
  }
};

// Find admin by email and valid OTP
exports.findAdminByEmailAndValidOtp = async (email, otp) => {
  try {
    const admin = await Admin.findOne({
      where: {
        email,
        resetOtp: otp,
        resetOtpExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!admin) {
      return {
        status: false,
        message: "Invalid or expired OTP.",
      };
    }

    return {
      status: true,
      message: "Valid OTP found.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in findAdminByEmailAndValidOtp:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error validating OTP.",
    };
  }
};

// Update password and clear OTP fields
exports.updatePasswordAndClearOtp = async (adminId, hashedPassword) => {
  try {
    const result = await Admin.update(
      {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
      {
        where: { id: adminId },
      }
    );

    if (result[0] === 0) {
      return {
        status: false,
        message: "Failed to update password. Admin not found.",
      };
    }

    return {
      status: true,
      message: "Password updated and OTP cleared.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in updatePasswordAndClearOtp:", error);

    return {
      status: false,
      message: error?.parent?.sqlMessage || error?.message || "Error updating password and clearing OTP.",
    };
  }
};
