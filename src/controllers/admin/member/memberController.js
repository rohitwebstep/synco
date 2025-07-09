const bcrypt = require("bcrypt");
const path = require("path");

const { createToken } = require("../../../utils/jwt");
const { generatePasswordHint } = require("../../../utils/auth");
const sendEmail = require("../../../utils/email/sendEmail");

const memberModel = require("../../../services/admin/member/member");
const emailModel = require("../../../services/email");
const { validateFormData } = require("../../../utils/validateFormData");
const { saveFile, deleteFile } = require("../../../utils/fileHandler");

const { logActivity } = require('../../../utils/admin/activityLogger');
const { createNotification } = require('../../../utils/admin/notificationHelper');

// Set DEBUG flag
const DEBUG = process.env.DEBUG === true;
const PANEL = 'admin';
const MODULE = 'member';

exports.createMember = async (req, res) => {
    try {
        const formData = req.body;
        const file = req.file;

        if (DEBUG) console.log("📥 Received FormData:", formData);
        if (DEBUG && file) console.log("📎 Received File:", file.originalname);

        const email = formData.email;
        const password = formData.password;
        const name = formData.name;
        const position = formData.position || null;
        const phoneNumber = formData.phoneNumber || null;
        const roleId = formData.role || null;

        if (DEBUG) console.log("🔍 Checking if email already exists:", email);

        const { status: exists, data: existingMember } = await memberModel.findMemberByEmail(email);
        if (exists && existingMember) {
            if (DEBUG) console.log("❌ Email already registered:", email);

            await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: 'This email is already registered. Please use another email.' }, false);
            return res.status(409).json({
                status: false,
                message: "This email is already registered. Please use another email.",
            });
        }

        if (DEBUG) console.log("✅ Email is available");

        const validation = validateFormData(formData, {
            requiredFields: ["name", "email", "password", "role"],
            patternValidations: {
                email: "email",
                status: "boolean",
            },
            fileExtensionValidations: {
                profile: ["jpg", "jpeg", "png", "webp"]
            }
        });

        if (!validation.isValid) {
            await logActivity(req, PANEL, MODULE, 'create', validation.error, false);
            if (DEBUG) console.log("❌ Form validation failed:", validation.error);
            return res.status(400).json({
                status: false,
                error: validation.error,
                message: validation.message,
            });
        }

        if (DEBUG) console.log("✅ Form validation passed");

        const statusRaw = (formData.status || "").toString().toLowerCase();
        const status = ["true", "1", "yes", "active"].includes(statusRaw);

        if (DEBUG) console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        if (DEBUG) console.log("📦 Creating member...");

        const createResult = await memberModel.createMember({
            firstName: name,
            email,
            password: hashedPassword,
            passwordHint: generatePasswordHint(password),
            position,
            phoneNumber,
            roleId,
            status,
        });

        if (!createResult.status) {
            await logActivity(req, PANEL, MODULE, 'create', createResult, false);

            if (DEBUG) console.log("❌ Member creation failed:", createResult.message);
            return res.status(500).json({
                status: false,
                message: createResult.message || "Failed to create member.",
            });
        }

        const memberId = createResult.data.id;
        let savedProfilePath = "";

        if (file) {
            const uniqueId = Math.floor(Math.random() * 1e9);
            const ext = path.extname(file.originalname).toLowerCase();
            const fileName = `${Date.now()}_${uniqueId}${ext}`;

            const fullPath = path.join(process.cwd(), "uploads", "member", `${memberId}`, "profile", fileName);
            savedProfilePath = `uploads/member/${memberId}/profile/${fileName}`;

            if (DEBUG) console.log("📁 Saving file to:", fullPath);

            try {
                await saveFile(file, fullPath);
                await memberModel.updateMember(memberId, { profile: savedProfilePath });

                if (DEBUG) console.log("✅ Profile image saved and updated in DB");
            } catch (fileErr) {
                console.error("❌ Failed to save profile image:", fileErr);
            }
        } else {
            if (DEBUG) console.log("ℹ️ No file uploaded, skipping file save.");
        }

        const successMessage = `New member '${name}' created successfully by Admin ID: ${req.admin.id}`;
        if (DEBUG) console.log("✅", successMessage);

        await logActivity(req, PANEL, MODULE, 'create', createResult, true);
        await createNotification(req, "New Member Added", successMessage, "Members");

        return res.status(201).json({
            status: true,
            message: "Member created successfully.",
            data: { memberId, profile: savedProfilePath },
        });

    } catch (error) {
        console.error("❌ Create Member Error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error occurred while creating the member. Please try again later.",
        });
    }
};

// ✅ Get all members
exports.getAllMembers = async (req, res) => {
    if (DEBUG) console.log("📋 Request received to list all members");

    try {
        const result = await memberModel.getAllMembers();

        if (!result.status) {
            if (DEBUG) console.log("❌ Failed to retrieve members:", result.message);

            await logActivity(req, PANEL, MODULE, 'list', result, false);
            return res.status(500).json({
                status: false,
                message: result.message || "Failed to fetch members.",
            });
        }

        if (DEBUG) {
            console.log(`✅ Retrieved ${result.data.length} member(s)`);
            console.table(result.data.map(m => ({
                ID: m.id,
                Name: m.name,
                Email: m.email,
                Created: m.createdAt,
            })));
        }

        await logActivity(req, PANEL, MODULE, 'list', { oneLineMessage: `Fetched ${result.data.length} member(s) successfully.` }, true);
        return res.status(200).json({
            status: true,
            message: `Fetched ${result.data.length} member(s) successfully.`,
            data: result.data,
        });
    } catch (error) {
        console.error("❌ List Members Error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to fetch members. Please try again later.",
        });
    }
};

// ✅ Get a specific member profile
exports.getMemberProfile = async (req, res) => {
    const { id } = req.params;

    if (DEBUG) console.log("👤 Fetching member profile for ID:", id);

    try {
        const result = await memberModel.getMemberById(id);

        if (!result.status || !result.data) {
            if (DEBUG) console.log("❌ Member not found with ID:", id);
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        const { data: member } = result;

        if (DEBUG) console.log("✅ Member found:", member);

        return res.status(200).json({
            status: true,
            message: "Member profile retrieved successfully.",
            data: member,
        });
    } catch (error) {
        console.error("❌ Get Member Profile Error:", error);
        return res.status(500).json({ status: false, message: "Failed to fetch member profile." });
    }
};

// ✅ Update member details
exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const formData = req.body;
    const file = req.file;

    if (DEBUG) console.log("🛠️ Updating member ID:", id);
    if (DEBUG) console.log("📥 Received Update FormData:", formData);
    if (DEBUG && file) console.log("📎 Received File:", file.originalname);

    try {
        // Check if member exists
        const existing = await memberModel.getMemberById(id);
        if (!existing.status || !existing.data) {
            if (DEBUG) console.log("❌ Member not found:", id);
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        if (DEBUG) console.log("🔍 Checking if email already exists:", formData.email);

        const { status: exists, data: existingMember } = await memberModel.findMemberByEmail(formData.email);
        if (exists && existingMember && existingMember.id.toString() !== id.toString()) {
            if (DEBUG) console.log("❌ Email already registered:", formData.email);
            return res.status(409).json({
                status: false,
                message: "This email is already registered. Please use another email.",
            });
        }

        // Validate input (if any fields sent)
        const validation = validateFormData(formData, {
            requiredFields: ["firstName", "email", "position", "phoneNumber", "country", "city"],
            patternValidations: {
                email: "email",
                status: "boolean",
                country: "number",
            },
            fileExtensionValidations: {
                profile: ["jpg", "jpeg", "png", "webp"],
            },
        });

        if (!validation.isValid) {
            if (DEBUG) console.log("❌ Validation failed:", validation.error);
            return res.status(400).json({
                status: false,
                error: validation.error,
                message: validation.message,
            });
        }

        // Prepare update data
        const updateData = {};
        if (formData.firstName) updateData.firstName = String(formData.firstName).trim();
        if (formData.lastName) updateData.lastName = String(formData.lastName).trim();
        if (formData.email) updateData.email = String(formData.email).trim();
        if (formData.position) updateData.position = String(formData.position).trim();
        if (formData.phoneNumber) updateData.phoneNumber = String(formData.phoneNumber).trim();
        if (formData.role) updateData.roleId = formData.role;
        if (formData.country) updateData.countryId = formData.country;
        if (formData.state) updateData.stateId = formData.state;
        if (formData.city) updateData.city = formData.city;
        if (formData.status) {
            const statusRaw = formData.status.toString().toLowerCase();
            updateData.status = ["true", "1", "yes", "active"].includes(statusRaw);
        }

        // Handle new profile image (if any)
        if (file) {
            const uniqueId = Math.floor(Math.random() * 1e9);
            const ext = path.extname(file.originalname).toLowerCase();
            const fileName = `${Date.now()}_${uniqueId}${ext}`;

            const fullPath = path.join(process.cwd(), "uploads", "member", `${id}`, "profile", fileName);
            const relativePath = `uploads/member/${id}/profile/${fileName}`;

            if (DEBUG) console.log("📁 Saving profile to:", fullPath);

            try {
                await saveFile(file, fullPath);
                updateData.profile = relativePath;

                await deleteFile(existingMember.profile);
                if (DEBUG) console.log("✅ Profile image saved and path set.");
            } catch (fileErr) {
                console.error("❌ Error saving profile image:", fileErr);
            }
        }

        // No update fields?
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No valid fields provided to update.",
            });
        }

        // Update DB
        const updateResult = await memberModel.updateMember(id, updateData);

        if (!updateResult.status) {
            if (DEBUG) console.log("❌ Failed to update member:", updateResult.message);
            return res.status(500).json({
                status: false,
                message: updateResult.message || "Failed to update member.",
            });
        }

        if (DEBUG) console.log("✅ Member updated successfully.");

        return res.status(200).json({
            status: true,
            message: "Member updated successfully.",
        });

    } catch (error) {
        console.error("❌ Update Member Error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to update member. Please try again later.",
        });
    }
};

// ✅ Update member status
exports.changeMemberStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;

    if (DEBUG) console.log(`🔄 Request to change member ID ${id} status to: ${status}`);

    const allowedStatuses = ["active", "inactive", "suspend"];
    const normalizedStatus = status?.toString().toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
            status: false,
            message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        });
    }

    try {
        const result = await memberModel.getMemberById(id);
        if (!result.status || !result.data) {
            if (DEBUG) console.log("❌ Member not found:", id);
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        const updateResult = await memberModel.updateMember(id, { status: normalizedStatus });

        if (!updateResult.status) {
            return res.status(500).json({
                status: false,
                message: updateResult.message || "Failed to update status.",
            });
        }

        if (DEBUG) console.log(`✅ Status of member ID ${id} changed to: ${normalizedStatus}`);

        return res.status(200).json({
            status: true,
            message: `Member status updated to '${normalizedStatus}' successfully.`,
        });
    } catch (error) {
        console.error("❌ Change Member Status Error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to update member status. Please try again later.",
        });
    }
};

// ✅ Delete a member
exports.deleteMember = async (req, res) => {
    const { id } = req.params;
    const adminId = req.admin?.id;

    if (DEBUG) console.log("🗑️ Request received to delete member ID:", id);

    try {
        // 🔍 Step 1: Check if member exists
        const result = await memberModel.getMemberById(id);

        if (!result.status || !result.data) {
            const message = `Member with ID ${id} not found.`;
            if (DEBUG) console.log("❌", message);

            await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: message }, false);
            await createNotification(req, "Delete Member Failed", message, "createNotification");

            return res.status(404).json({ status: false, message });
        }

        const member = result.data;

        // 🧹 Step 2: Attempt to delete
        const deleteResult = await memberModel.deleteMember(id);

        if (!deleteResult.status) {
            const message = deleteResult.message || `Failed to delete member with ID ${id}.`;
            if (DEBUG) console.log("❌", message);

            await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: message }, false);
            await createNotification(req, "Delete Member Failed", message, "Members");

            return res.status(500).json({ status: false, message });
        }

        const successMessage = `Member '${member.firstName} ${member.lastName || ""}' (ID: ${id}) deleted by Admin ID: ${adminId}`;
        if (DEBUG) console.log("✅", successMessage);

        await logActivity(req, PANEL, MODULE, 'delete', { oneLineMessage: successMessage }, true);
        await createNotification(req, "Member Deleted", successMessage, "Cancelled Memberships");

        return res.status(200).json({
            status: true,
            message: "Member deleted successfully.",
        });

    } catch (error) {
        const errorMsg = error?.message || "Failed to delete member due to server error.";
        console.error("❌ Delete Member Error:", error);

        await createNotification(req, "Delete Member Error", errorMsg, "Members");

        return res.status(500).json({
            status: false,
            message: "An unexpected error occurred while deleting the member. Please try again later.",
        });
    }
};