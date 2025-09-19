const notificationModel = require("../../../services/admin/notification/notification");
const { getAdminRoleById } = require("../../../services/admin/adminRole");
const customNotificationModel = require("../../../services/admin/notification/customNotification");
const { logActivity } = require("../../../utils/admin/activityLogger");

const validCategories = [
  "All",
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

const DEBUG = process.env.DEBUG === "true";

const PANEL = "admin";
const MODULE = "notification";

// exports.markNotificationAsRead = async (req, res) => {
//   const userId = req.admin?.id;
//   const roleName = req.admin?.role;
//   const category = req.body?.category || null;

//   console.log("req.admin:", req.admin);
//   console.log("Extracted userId:", userId);
//   console.log("Extracted roleName:", roleName);
//   console.log("Category for mark as read:", category);

//   if (!roleName || !userId) {
//     return res.status(400).json({
//       status: false,
//       message: "Invalid admin information.",
//     });
//   }

//   // Optional: Validate category against allowed list
//   if (category && !validCategories.includes(category)) {
//     return res.status(400).json({
//       status: false,
//       message: `Invalid category provided: ${category}`,
//     });
//   }

//   try {
//     let result;

//     if (category) {
//       result = await customNotificationModel.markAsRead(userId, category);
//     } else {
//       result = await notificationModel.markAsRead(userId);
//     }

//     if (!result.status) {
//       console.error(`❌ Failed to mark as read:`, result.message);
//       await logActivity(req, PANEL, MODULE, "markRead", result, false);
//       return res.status(500).json({ status: false, message: result.message });
//     }

//     if (DEBUG) console.log(`✅ Marked as read:`, result.updatedCount);

//     await logActivity(
//       req,
//       PANEL,
//       MODULE,
//       "markRead",
//       { oneLineMessage: result.message },
//       true
//     );

//     return res.status(200).json({
//       status: true,
//       message: result.message,
//       data: result.updatedCount || 0,
//     });
//   } catch (error) {
//     console.error(`❌ Error marking as read:`, error);
//     await logActivity(
//       req,
//       PANEL,
//       MODULE,
//       "markRead",
//       { oneLineMessage: error.message },
//       false
//     );
//     return res.status(500).json({
//       status: false,
//       message: "Server error while marking notifications as read.",
//     });
//   }
// };
exports.markNotificationAsRead = async (req, res) => {
  const userId = req.admin?.id;
  const roleName = req.admin?.role;
  const category = req.body?.category || null;

  console.log("req.admin:", req.admin);
  console.log("Extracted userId:", userId);
  console.log("Extracted roleName:", roleName);
  console.log("Category for mark as read:", category);

  if (!roleName || !userId) {
    return res.status(400).json({
      status: false,
      message: "Invalid admin information.",
    });
  }

  // Optional: Validate category against allowed list
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      status: false,
      message: `Invalid category provided: ${category}`,
    });
  }

  try {
    let result;
    if (category === "All") {
      // ✅ Mark both custom and normal notifications as read
      const normalResult = await notificationModel.markAsRead(userId);
      const customResult = await customNotificationModel.markAsRead(userId);

      if (!normalResult.status || !customResult.status) {
        const errorMsg =
          normalResult.message ||
          customResult.message ||
          "Failed to mark all as read.";
        console.error(`❌ Failed to mark all as read:`, errorMsg);
        await logActivity(
          req,
          PANEL,
          MODULE,
          "markRead",
          { oneLineMessage: errorMsg },
          false
        );
        return res.status(500).json({ status: false, message: errorMsg });
      }

      result = {
        status: true,
        message: "All notifications marked as read successfully.",
        updatedCount:
          (normalResult.updatedCount || 0) + (customResult.updatedCount || 0),
      };
    } else if (category === "System") {
      // ✅ System notifications are in the normal model
      result = await notificationModel.markAsRead(userId);
    } else if (category) {
      // ✅ Custom notifications by category
      result = await customNotificationModel.markAsRead(userId, category);
    } else {
      // ✅ Default = normal notifications
      result = await notificationModel.markAsRead(userId);
    }

    if (!result.status) {
      console.error(`❌ Failed to mark as read:`, result.message);
      await logActivity(req, PANEL, MODULE, "markRead", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log(`✅ Marked as read:`, result.updatedCount);

    await logActivity(
      req,
      PANEL,
      MODULE,
      "markRead",
      { oneLineMessage: result.message },
      true
    );

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.updatedCount || 0,
    });
  } catch (error) {
    console.error(`❌ Error marking as read:`, error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "markRead",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({
      status: false,
      message: "Server error while marking notifications as read.",
    });
  }
};

// ✅ Get all notifications
exports.getAllNotifications = async (req, res) => {
  const adminId = req.admin?.id;
  const category = req.query?.category || null;

  if (DEBUG) {
    console.log(`📨 Fetching notifications for Admin ID: ${adminId}`);
    console.log(`📂 Category filter: ${category}`);
    console.log(`🔐 Admin Role: ${req.admin?.role}`);
  }

  try {
    // ✅ For normal notifications, still exclude own-created if required
    const notificationResult = await notificationModel.getAllNotifications(
      adminId,
      category,
      { excludeOwn: true }
    );

    // ✅ For custom notifications, DO NOT exclude own-created
    const customNotificationResult =
      await customNotificationModel.getAllReceivedCustomNotifications(
        adminId,
        category
      );

    if (!notificationResult.status || !customNotificationResult.status) {
      const errorMsg =
        notificationResult.message ||
        customNotificationResult.message ||
        "Failed to fetch notifications.";

      console.error("❌ Notification fetch failed:", errorMsg);

      await logActivity(
        req,
        PANEL,
        MODULE,
        "list",
        { oneLineMessage: errorMsg },
        false
      );

      return res.status(500).json({ status: false, message: errorMsg });
    }

    const combinedData = {
      notifications: notificationResult.data || [],
      customNotifications: customNotificationResult.data || [],
    };

    const totalCount =
      (combinedData.notifications.length || 0) +
      (combinedData.customNotifications.length || 0);

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      {
        oneLineMessage: `Successfully fetched ${totalCount} notification(s).`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Notifications fetched successfully.",
      data: combinedData,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error.message);

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      { oneLineMessage: error.message },
      false
    );

    return res.status(500).json({
      status: false,
      message: "Server error while fetching notifications.",
    });
  }
};
