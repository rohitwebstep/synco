const { AdminRole } = require("../../models");

// ✅ Create a role
exports.createAdminRole = async ({ role }) => {
    try {
        const newRole = await AdminRole.create({ role: role.trim() });

        return {
            status: true,
            message: "Role created successfully.",
            data: newRole,
        };
    } catch (error) {
        console.error("❌ Sequelize Error in createRole:", error);

        return {
            status: false,
            message: error?.parent?.sqlMessage || error?.message || "Failed to create role.",
        };
    }
};

// ✅ Find role by name
exports.findAdminRoleByRole = async (role) => {
    try {
        const existingRole = await AdminRole.findOne({ where: { role } });

        if (!existingRole) {
            return {
                status: false,
                message: "Role not found.",
            };
        }

        return {
            status: true,
            message: "Role found.",
            data: existingRole,
        };
    } catch (error) {
        console.error("❌ Sequelize Error in findRoleByRole:", error);

        return {
            status: false,
            message: error?.parent?.sqlMessage || error?.message || "Error finding role.",
        };
    }
};

// ✅ Get all roles
exports.getAllAdminRoles = async () => {
    try {
        const roles = await AdminRole.findAll({
            order: [["createdAt", "DESC"]],
        });

        return {
            status: true,
            message: `Fetched ${roles.length} role(s) successfully.`,
            data: roles,
        };
    } catch (error) {
        console.error("❌ Sequelize Error in getAllRoles:", error);

        return {
            status: false,
            message: error?.parent?.sqlMessage || error?.message || "Failed to fetch roles.",
        };
    }
};

// ✅ Get role by ID
exports.getAdminRoleById = async (id) => {
    try {
        const role = await AdminRole.findByPk(id);

        if (!role) {
            return {
                status: false,
                message: "Role not found.",
            };
        }

        return {
            status: true,
            message: "Role found.",
            data: role,
        };
    } catch (error) {
        console.error("❌ Sequelize Error in getRoleById:", error);

        return {
            status: false,
            message: error?.parent?.sqlMessage || error?.message || "Error retrieving role.",
        };
    }
};

// ✅ Update role
exports.updateAdminRole = async (id, updateData) => {
    try {
        const [updated] = await AdminRole.update(updateData, { where: { id } });

        if (updated === 0) {
            return {
                status: false,
                message: "No role updated. ID may be incorrect.",
            };
        }

        return {
            status: true,
            message: "Role updated successfully.",
        };
    } catch (error) {
        console.error("❌ Sequelize Error in updateRole:", error);

        return {
            status: false,
            message: error?.parent?.sqlMessage || error?.message || "Failed to update role.",
        };
    }
};

// ✅ Delete role
exports.deleteAdminRole = async (id) => {
    try {
        const deleted = await AdminRole.destroy({ where: { id } });

        if (deleted === 0) {
            return {
                status: false,
                message: "No role deleted. ID may be incorrect.",
            };
        }

        return {
            status: true,
            message: "Role deleted successfully.",
        };
    } catch (error) {
        console.error("❌ Sequelize Error in deleteRole:", error);

        return {
            status: false,
            message: error?.parent?.sqlMessage || error?.message || "Failed to delete role.",
        };
    }
};
