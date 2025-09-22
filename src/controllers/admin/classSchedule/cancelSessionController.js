const { logActivity } = require("../../../utils/admin/activityLogger");
const {
  createNotification,
} = require("../../../utils/admin/notificationHelper");
const CancelClassService = require("../../../services/admin/classSchedule/cancelSession.js");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "cancel-class";

exports.cancelClassSession = async (req, res) => {
  try {
    const { classScheduleId } = req.params;
    const {
      reasonForCancelling,
      notifyMembers = "No",
      creditMembers = "No",
      notifyTrialists = "No",
      notifyCoaches = "No",
      roles = [],
    } = req.body;

    const adminId = req.admin?.id;

    if (DEBUG) {
      console.log("📥 Cancel request for classScheduleId:", classScheduleId);
      console.log("📥 Roles config:", roles);
    }

    // --- NEW: extract mapId from query ---
    const mapIdRaw = req.query.mapId;
    const mapId = mapIdRaw ? parseInt(mapIdRaw, 10) : null;

    if (DEBUG) {
      console.log("🔍 mapId from query:", mapIdRaw, "parsed:", mapId);
    }

    if (!mapId) {
      await logActivity(
        req,
        PANEL,
        MODULE,
        "cancel",
        { message: "mapId query param required" },
        false
      );
      return res.status(400).json({
        status: false,
        message: "Missing required query parameter: mapId",
      });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      await logActivity(
        req,
        PANEL,
        MODULE,
        "cancel",
        { message: "Roles array required" },
        false
      );
      return res.status(400).json({
        status: false,
        message: "Invalid payload: 'roles' must be a non-empty array.",
      });
    }

    const notifications = roles.map((roleConfig) => ({
      role: roleConfig.notifyType,
      subjectLine: roleConfig.subjectLine,
      emailBody: roleConfig.emailBody,
      deliveryMethod: roleConfig.deliveryMethod || "Email",
      templateKey: roleConfig.templateKey || "cancel",
    }));

    const cancelData = {
      reasonForCancelling,
      notifyMembers,
      creditMembers,
      notifyTrialists,
      notifyCoaches,
      notifications,
      mapId,
    };

    const cancelResult = await CancelClassService.createCancellationRecord(
      classScheduleId,
      cancelData,
      adminId
    );

    const hasSuccess = cancelResult.status === true;

    await logActivity(req, PANEL, MODULE, "cancel", cancelResult, hasSuccess);

    if (hasSuccess) {
      await createNotification(
        req,
        "Class Session Cancelled",
        `Class "${
          cancelResult.data?.classSchedule?.className || "N/A"
        }" has been cancelled.`,
        "Admins"
      );
    }

    return res.status(hasSuccess ? 201 : 400).json({
      status: hasSuccess,
      message: hasSuccess
        ? "Class session cancelled successfully."
        : "Cancellation failed.",
      data: cancelResult.data,
    });
  } catch (error) {
    console.error("❌ Error cancelling class session:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "cancel",
      { error: error.message },
      false
    );
    return res.status(500).json({
      status: false,
      message: "An error occurred while cancelling class session.",
      error: error.message,
    });
  }
};

// ✅ GET all cancelled session details
// exports.getAllCancelledSessions = async (req, res) => {
//   if (DEBUG) {
//     console.log("📥 Received request to get all cancelled sessions");
//   }

//   try {
//     // Step 1: Call service
//     const result = await CancelClassService.getAllCancelledSessions();

//     // Step 2: Handle failure
//     if (!result.status) {
//       if (DEBUG) console.log("⚠️ Service failed:", result.message);
//       await logActivity(req, PANEL, MODULE, "view", result, false);
//       return res.status(404).json({ status: false, message: result.message });
//     }

//     // Step 3: Log success
//     await logActivity(
//       req,
//       PANEL,
//       MODULE,
//       "view",
//       { oneLineMessage: "Fetched all cancelled sessions" },
//       true
//     );

//     // Step 4: Send response
//     return res.status(200).json({
//       status: true,
//       message: "Fetched all cancelled sessions successfully.",
//       data: result.data,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching all cancelled sessions:", error);
//     await logActivity(
//       req,
//       PANEL,
//       MODULE,
//       "view",
//       { oneLineMessage: error.message },
//       false
//     );
//     return res.status(500).json({ status: false, message: "Server error." });
//   }
// };
