const customNotificationModel = require("../../../services/admin/notification/customNotification");
const { logActivity } = require("../../../utils/admin/activityLogger");

const validCategories = [
  "Complaints",
  "Payments",
  "Cancelled Memberships",
  "Members",
  "Member Roles",
  "System",
  "Activity Logs",
  "Security",
  "Login",
  "Settings",
  "Updates",
  "Announcements",
  "Tasks",
  "Messages",
  "Support"
];

const DEBUG = process.env.DEBUG === "true";
const PANEL = 'admin';
const MODULE = 'notification';

// ✅ Create a new notification
exports.createCustomNotification = async (req, res) => {
  const { title, description, category, recipients } = req.body;

  if (DEBUG) console.log("📥 Create request:", { title, description, category, recipients });

  if (!category) {
    const message = "Category is required.";
    if (DEBUG) console.warn(`⚠️ ${message}`);
    await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: message }, false);
    return res.status(400).json({ status: false, message });
  }

  if (!validCategories.includes(category)) {
    const message = `Invalid category. Valid categories are: ${validCategories.join(", ")}`;
    if (DEBUG) console.warn(`🚫 ${message}`);
    await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: message }, false);
    return res.status(422).json({ status: false, message });
  }

  try {
    const result = await customNotificationModel.createCustomNotification(
      title || null,
      description || null,
      category,
      req.admin.id
    );

    if (!result.status) {
      if (DEBUG) console.error("❌ Creation failed:", result.message);
      await logActivity(req, PANEL, MODULE, 'create', result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    // ✅ Create notification reads for each recipient
    const memberIds = (recipients || "").split(',').map(id => id.trim()).filter(Boolean);

    await Promise.all(
      memberIds.map(async (memberId) => {
        const payload = {
          customNotificationId: result.data.id,
          memberId: parseInt(memberId, 10)
        };

        const readResult = await customNotificationModel.createCustomNotificationReads(payload);

        if (!readResult.status) {
          if (DEBUG) console.error(`❌ Failed to create read record for member ${memberId}:`, readResult.message);
          await logActivity(req, PANEL, MODULE, 'create', readResult, false);
          // Note: optionally continue or stop execution here
          throw new Error(`Failed to create read record for member ${memberId}`);
        }
      })
    );

    if (DEBUG) console.log("✅ Created notification:", result.data);
    await logActivity(req, PANEL, MODULE, 'create', result, true);

    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });

  } catch (error) {
    console.error("❌ Exception while creating notification:", error.message);
    await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: error.message }, false);
    return res.status(500).json({
      status: false,
      message: "Server error while creating notification.",
    });
  }
};
