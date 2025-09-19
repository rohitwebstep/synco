const notificationService = require("../../services/admin/notification/notification");

const DEBUG = process.env.DEBUG === "true";

/**
 * Logs a notification for admin panel actions.
 *
 * @param {Object} req - Express request object containing the admin session
 * @param {string} title - Notification title
 * @param {string} description - Detailed description for the notification
 * @param {string} category - One of the valid categories (e.g., "Complaints", "Payments", "Cancelled Memberships")
 * @param {string} [scope='global'] - Notification scope (default is 'global')
 *
 * @returns {Object} Response object with status, message, and optional data
 */
exports.createNotification = async (
  req,
  title,
  description,
  category,
  scope = "global"
) => {
  if (scope !== "global") {
    console.warn(
      `⚠️ Skipping notification log due to non-global scope: ${scope}`
    );
    return {
      status: true,
      message: "Scope not applicable for global notifications.",
    };
  }

  if (DEBUG) {
    console.log(
      `🟢 [createNotification] Initiated by Admin: ${req?.admin?.name}`
    );
    console.log(`📩 Details →`, { title, description, category, scope });
  }

  if (!category) {
    const message = "Notification category is required.";
    console.warn(`⚠️ ${message}`);
    return { status: false, message };
  }

  const validCategories = [
    "Complaints",
    "Payments",
    "Discounts",
    "Cancelled Memberships",
    "Admins",
    "Admin Roles",
    "System",
    "Activity Logs",
    "Security",
    "Login",
    "Settings",
    "Updates",
    "Announcements",
    "Tasks",
    "Messages",
    "Support",
  ];

  if (!validCategories.includes(category)) {
    const message = `Invalid category. Allowed categories: ${validCategories.join(
      ", "
    )}`;
    console.warn(`🚫 ${message}`);
    return { status: false, message };
  }

  try {
    const result = await notificationService.createNotification(
      title || null,
      description || null,
      category,
      req?.admin?.id
    );

    if (!result.status) {
      console.error(`❌ Notification creation failed:`, result.message);
      return { status: false, message: result.message };
    }

    if (DEBUG) {
      console.log(`✅ Notification created successfully.`);
      console.log(`📦 Result:`, result.data);
    }

    return {
      status: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    const errorMessage =
      error?.message || "Unhandled error while creating notification.";
    console.error(`❌ [Exception] Notification creation error:`, errorMessage);
    return {
      status: false,
      message: "Server error occurred while logging notification.",
    };
  }
};
