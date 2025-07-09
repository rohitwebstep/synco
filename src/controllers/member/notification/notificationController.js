const notificationModel = require("../../../services/member/notification/notification");
// const { logActivity } = require("../../../utils/member/activityLogger");

const DEBUG = process.env.DEBUG === "true";

const PANEL = 'member';
const MODULE = 'notification';

// ✅ Get all notifications
exports.getAllNotifications = async (req, res) => {
  if (DEBUG) console.log(`📨 Fetching all notifications for Member ID: ${req.member.id}`);

  try {
    const result = await notificationModel.getAllNotifications(req.member.id);

    if (!result.status) {
      if (DEBUG) console.error(`❌ Fetch failed:`, result.message);
      /*
      await logActivity(req, PANEL, MODULE, 'list', result, false);
      */
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log(`📊 Total notifications:`, result.data.notifications?.length);
    /*
    await logActivity(req, PANEL, MODULE, 'list', {
      oneLineMessage: `Fetched ${result.data.notifications?.length || 0} notification(s) successfully.`,
    }, true);
    */

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(`❌ Error fetching all notifications:`, error);
    /*
    await logActivity(req, PANEL, MODULE, 'list', { oneLineMessage: error.message }, false);
    */

    return res.status(500).json({
      status: false,
      message: "Server error while fetching notifications.",
    });
  }
};

// ✅ Get all notifications
exports.markCustomNotificationAsRead = async (req, res) => {
  const memberId = req.member?.id;

  if (DEBUG) console.log(`📨 Marking all unread notifications as read for Member ID: ${memberId}`);
  try {
    const result = await notificationModel.markCustomNotificationAsRead(memberId);

    if (!result.status) {
      if (DEBUG) console.error(`❌ Update failed:`, result.message);

      // Optional activity logging
      // await logActivity(req, PANEL, MODULE, 'update', result, false);

      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log(`✅ Notifications marked as read:`, result.message);

    // Optional activity logging
    // await logActivity(req, PANEL, MODULE, 'update', {
    //   oneLineMessage: result.message,
    // }, true);

    return res.status(200).json({
      status: true,
      message: result.message
    });
  } catch (error) {
    console.error(`❌ Error fetching all notifications:`, error);
    /*
    await logActivity(req, PANEL, MODULE, 'list', { oneLineMessage: error.message }, false);
    */

    return res.status(500).json({
      status: false,
      message: "Server error while fetching notifications.",
    });
  }
};
