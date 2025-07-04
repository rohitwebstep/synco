const { validateFormData } = require("../../utils/validateFormData");
const memberRoleModel = require("../../services/admin/memberRole");

const DEBUG = process.env.DEBUG === "true";

// ✅ Create Role
exports.createRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (DEBUG) console.log("📥 Received Role Role:", role);

        // Validate
        const validation = validateFormData({ role }, {
            requiredFields: ["role"]
        });

        if (!validation.isValid) {
            if (DEBUG) console.log("❌ Validation failed:", validation.error);
            return res.status(400).json({
                status: false,
                error: validation.error,
                message: validation.message,
            });
        }

        // Check if role already exists
        const { status: exists, data: existingRole } = await memberRoleModel.findRoleByRole(role);
        if (exists && existingRole) {
            return res.status(409).json({
                status: false,
                message: "This role already exists. Please use a different role.",
            });
        }

        // Create
        const createResult = await memberRoleModel.createRole({ role });

        if (!createResult.status) {
            return res.status(500).json({
                status: false,
                message: createResult.message || "Failed to create role.",
            });
        }

        if (DEBUG) console.log("✅ Role created:", createResult.data);

        return res.status(201).json({
            status: true,
            message: "Role created successfully.",
        });
    } catch (error) {
        console.error("❌ Create Role Error:", error);
        return res.status(500).json({ status: false, message: "Server error while creating role." });
    }
};

// ✅ List All Roles
exports.listRoles = async (req, res) => {
    try {
        const result = await memberRoleModel.getAllRoles();

        if (!result.status) {
            return res.status(500).json({ status: false, message: result.message });
        }

        if (DEBUG) console.table(result.data);

        return res.status(200).json({
            status: true,
            message: "Fetched roles successfully.",
            data: result.data,
        });
    } catch (error) {
        console.error("❌ List Roles Error:", error);
        return res.status(500).json({ status: false, message: "Failed to fetch roles." });
    }
};

// ✅ Get Role by ID
exports.getRoleById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await memberRoleModel.getRoleById(id);

        if (!result.status || !result.data) {
            return res.status(404).json({ status: false, message: "Role not found." });
        }

        return res.status(200).json({
            status: true,
            message: "Role fetched successfully.",
            data: result.data,
        });
    } catch (error) {
        console.error("❌ Get Role Error:", error);
        return res.status(500).json({ status: false, message: "Failed to fetch role." });
    }
};

// ✅ Update Role
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({
            status: false,
            message: "Role role is required.",
        });
    }

    try {
        const existing = await memberRoleModel.getRoleById(id);
        if (!existing.status || !existing.data) {
            return res.status(404).json({ status: false, message: "Role not found." });
        }

        const exists = await memberRoleModel.findRoleByRole(role);
        if (exists.status && exists.data && exists.data.id != id) {
            return res.status(409).json({
                status: false,
                message: "Role role already exists.",
            });
        }

        const update = await memberRoleModel.updateRole(id, { role });

        if (!update.status) {
            return res.status(500).json({ status: false, message: update.message });
        }

        return res.status(200).json({
            status: true,
            message: "Role updated successfully.",
        });
    } catch (error) {
        console.error("❌ Update Role Error:", error);
        return res.status(500).json({ status: false, message: "Failed to update role." });
    }
};

// ✅ Delete Role
exports.deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await memberRoleModel.getRoleById(id);
        if (!result.status || !result.data) {
            return res.status(404).json({ status: false, message: "Role not found." });
        }

        const deleteResult = await memberRoleModel.deleteRole(id);

        if (!deleteResult.status) {
            return res.status(500).json({ status: false, message: deleteResult.message });
        }

        return res.status(200).json({
            status: true,
            message: "Role deleted successfully.",
        });
    } catch (error) {
        console.error("❌ Delete Role Error:", error);
        return res.status(500).json({ status: false, message: "Failed to delete role." });
    }
};
