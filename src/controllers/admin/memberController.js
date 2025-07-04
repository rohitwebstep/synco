const bcrypt = require("bcrypt");
const { createToken } = require("../../utils/jwt");
const sendEmail = require("../../utils/email/sendEmail");

const memberModel = require("../../services/admin/member");
const emailModel = require("../../services/email");
const { validateFormData } = require("../../utils/validateFormData");

// ✅ Create a new member
exports.createMember = async (req, res) => {
    try {
        const formData = req.body;

        const email = formData.email;
        const password = formData.password;
        const name = formData.name;
        const position = formData.position || null;
        const phoneNumber = formData.phoneNumber || null;
        const roleId = formData.roleId || null;

        // Check if email already exists
        const { status: exists, data: existingMember } = await memberModel.findMemberByEmail(email);
        if (exists && existingMember) {
            return res.status(409).json({
                status: false,
                message: "This email is already registered. Please use another email.",
            });
        }

        // Validate fields
        const validation = validateFormData(formData, {
            requiredFields: ["name", "email", "password", "roleId"],
            patternValidations: {
                email: "email",
                status: "boolean",
            },
        });

        if (!validation.isValid) {
            logMessage("warn", "Form validation failed", validation.error);
            return res.status(400).json({
                status: false,
                error: validation.error,
                message: validation.message,
            });
        }

        // Convert status string to boolean
        const statusRaw = (formData.status || "").toString().toLowerCase();
        const status = ["true", "1", "yes", "active"].includes(statusRaw);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create member (no profile image)
        const createResult = await memberModel.createMember({
            name,
            email,
            password: hashedPassword,
            position,
            phoneNumber,
            roleId,
            profile: "", // No profile image handled
            status,
        });

        if (!createResult.status) {
            return res.status(500).json({
                status: false,
                message: createResult.message || "Failed to create member.",
            });
        }

        return res.status(201).json({
            status: true,
            message: "Member created successfully.",
            data: { memberId: createResult.data.id },
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
exports.listMembers = async (req, res) => {
    try {
        const result = await memberModel.getAllMembers();

        if (!result.status) {
            return res.status(500).json({ status: false, message: result.message || "Failed to fetch members." });
        }

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

    try {
        const result = await memberModel.getMemberById(id);

        if (!result.status || !result.data) {
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        const { data: member } = result;

        return res.status(200).json({
            status: true,
            message: "Member profile retrieved successfully.",
            data: {
                id: member.id,
                name: member.name,
                email: member.email,
                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
            },
        });
    } catch (error) {
        console.error("❌ Get Member Profile Error:", error);
        return res.status(500).json({ status: false, message: "Failed to fetch member profile." });
    }
};

// ✅ Update member details
exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name && !email) {
        return res.status(400).json({
            status: false,
            message: "At least one field (name or email) is required to update.",
        });
    }

    try {
        const result = await memberModel.getMemberById(id);
        if (!result.status || !result.data) {
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        const updateResult = await memberModel.updateMember(id, { name, email });

        if (!updateResult.status) {
            return res.status(500).json({ status: false, message: updateResult.message || "Failed to update member." });
        }

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

// ✅ Delete a member
exports.deleteMember = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await memberModel.getMemberById(id);
        if (!result.status || !result.data) {
            return res.status(404).json({ status: false, message: "Member not found." });
        }

        const deleteResult = await memberModel.deleteMember(id);

        if (!deleteResult.status) {
            return res.status(500).json({ status: false, message: deleteResult.message || "Failed to delete member." });
        }

        return res.status(200).json({
            status: true,
            message: "Member deleted successfully.",
        });
    } catch (error) {
        console.error("❌ Delete Member Error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to delete member. Please try again later.",
        });
    }
};
