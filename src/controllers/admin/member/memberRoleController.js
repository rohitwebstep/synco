const { validateFormData } = require("../../../utils/validateFormData");
const memberRoleModel = require("../../../services/admin/member/memberRole");
const { logActivity } = require("../../../utils/admin/activityLogger");
const { createNotification } = require('../../../utils/admin/notificationHelper');

const DEBUG = process.env.DEBUG === true;
const PANEL = 'admin';
const MODULE = 'member-role';

// ✅ Create Role
exports.createMemberRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (DEBUG) console.log("📥 Received Role:", role);

        const validation = validateFormData({ role }, {
            requiredFields: ["role"]
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

        const { status: exists, data: existingRole } = await memberRoleModel.findMemberRoleByRole(role);
        if (exists && existingRole) {
            const message = "This role already exists. Please use a different role.";
            await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: message }, false);
            return res.status(409).json({ status: false, message });
        }

        const createResult = await memberRoleModel.createMemberRole({ role });

        if (!createResult.status) {
            await logActivity(req, PANEL, MODULE, 'create', createResult, false);
            return res.status(500).json({
                status: false,
                message: createResult.message || "Failed to create role.",
            });
        }

        const successMessage = `New member Role '${role}' created successfully by Admin ID: ${req.admin.id}`;
        if (DEBUG) console.log("✅", successMessage);

        await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: `Role "${role}" created.` }, true);
        await createNotification(req, "New Member Role Added", successMessage, "Member Roles");

        return res.status(201).json({
            status: true,
            message: "Role created successfully.",
        });
    } catch (error) {
        console.error("❌ Create Role Error:", error);
        await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: error.message }, false);
        return res.status(500).json({ status: false, message: "Server error while creating role." });
    }
};

// ✅ List All Roles
exports.getAllMemberRoles = async (req, res) => {
    try {
        const result = await memberRoleModel.getAllMemberRoles();

        if (!result.status) {
            await logActivity(req, PANEL, MODULE, 'list', result, false);
            return res.status(500).json({ status: false, message: result.message });
        }

        if (DEBUG) console.table(result.data);
        await logActivity(req, PANEL, MODULE, 'list', {
            oneLineMessage: `Fetched ${result.data.length} roles.`
        }, true);

        return res.status(200).json({
            status: true,
            message: "Fetched roles successfully.",
            data: result.data,
        });
    } catch (error) {
        console.error("❌ List Roles Error:", error);
        await logActivity(req, PANEL, MODULE, 'list', { oneLineMessage: error.message }, false);
        return res.status(500).json({ status: false, message: "Failed to fetch roles." });
    }
};

// ✅ Get Role by ID
exports.getMemberRoleById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await memberRoleModel.getMemberRoleById(id);

        if (!result.status || !result.data) {
            const message = "Role not found.";
            await logActivity(req, PANEL, MODULE, 'getById', { oneLineMessage: message }, false);
            return res.status(404).json({ status: false, message });
        }

        await logActivity(req, PANEL, MODULE, 'getById', {
            oneLineMessage: `Fetched role ID ${id}`
        }, true);

        return res.status(200).json({
            status: true,
            message: "Role fetched successfully.",
            data: result.data,
        });
    } catch (error) {
        console.error("❌ Get Role Error:", error);
        await logActivity(req, PANEL, MODULE, 'getById', { oneLineMessage: error.message }, false);
        return res.status(500).json({ status: false, message: "Failed to fetch role." });
    }
};

// ✅ Update Role
exports.updateMemberRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        const message = "Role role is required.";
        await logActivity(req, PANEL, MODULE, 'update', { oneLineMessage: message }, false);
        return res.status(400).json({ status: false, message });
    }

    try {
        const existing = await memberRoleModel.getMemberRoleById(id);
        if (!existing.status || !existing.data) {
            const message = "Role not found.";
            await logActivity(req, PANEL, MODULE, 'update', { oneLineMessage: message }, false);
            return res.status(404).json({ status: false, message });
        }

        const exists = await memberRoleModel.findMemberRoleByRole(role);
        if (exists.status && exists.data && exists.data.id != id) {
            const message = "Role role already exists.";
            await logActivity(req, PANEL, MODULE, 'update', { oneLineMessage: message }, false);
            return res.status(409).json({ status: false, message });
        }

        const update = await memberRoleModel.updateMemberRole(id, { role });

        if (!update.status) {
            await logActivity(req, PANEL, MODULE, 'update', update, false);
            return res.status(500).json({ status: false, message: update.message });
        }

        await logActivity(req, PANEL, MODULE, 'update', {
            oneLineMessage: `Updated role ID ${id} to "${role}"`
        }, true);

        return res.status(200).json({
            status: true,
            message: "Role updated successfully.",
        });
    } catch (error) {
        console.error("❌ Update Role Error:", error);
        await logActivity(req, PANEL, MODULE, 'update', { oneLineMessage: error.message }, false);
        return res.status(500).json({ status: false, message: "Failed to update role." });
    }
};

// ✅ Delete Role
exports.deleteMemberRole = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await memberRoleModel.getMemberRoleById(id);
        if (!result.status || !result.data) {
            const message = "Role not found.";
            await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: message }, false);
            return res.status(404).json({ status: false, message });
        }

        const deleteResult = await memberRoleModel.deleteMemberRole(id);

        if (!deleteResult.status) {
            await logActivity(req, PANEL, MODULE, 'delete', deleteResult, false);
            return res.status(500).json({ status: false, message: deleteResult.message });
        }

        await logActivity(req, PANEL, MODULE, 'delete', {
            oneLineMessage: `Deleted role ID ${id}`
        }, true);

        return res.status(200).json({
            status: true,
            message: "Role deleted successfully.",
        });
    } catch (error) {
        console.error("❌ Delete Role Error:", error);
        await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: error.message }, false);
        return res.status(500).json({ status: false, message: "Failed to delete role." });
    }
};
