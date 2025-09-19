const { validateFormData } = require("../../../utils/validateFormData");
const BookingTrialService = require("../../../services/admin/booking/serviceHistory");
// const Admin = require("../../../services/admin/Admin");
const { logActivity } = require("../../../utils/admin/activityLogger");
const emailModel = require("../../../services/email");
const sendEmail = require("../../../utils/email/sendEmail");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "service_history";

exports.getAccountProfile = async (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;
  if (DEBUG) console.log(`🔍 Fetching free trial booking ID: ${id}`);

  try {
    // const result = await BookingTrialService.getBookingById(id);
    const result = await BookingTrialService.getBookingById(id, adminId); // ✅ pass adminId

    if (!result.status) {
      return res.status(404).json({ status: false, message: result.message });
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "getById",
      { message: `Fetched booking ID: ${id}` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Fetched booking details successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "getById",
      { error: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

exports.updateBooking = async (req, res) => {
  const adminId = req.admin?.id;
  const payload = req.body || {};

  // Prefer id from body, support either `id` or `bookingId`, fallback to URL param
  const id = payload.id || payload.bookingId || req.params.id;

  console.log(`✏️ Step 1: Updating booking ID: ${id}`, payload);

  try {
    if (!id) {
      console.log("❌ Booking ID missing.");
      return res.status(400).json({
        status: false,
        message:
          "Booking ID is required (body.id | body.bookingId | params.id).",
      });
    }

    // Step 2: Validate body fields
    const { isValid, error } = validateFormData(payload, {
      requiredFields: ["startDate", "totalStudents"], // adjust as needed
    });
    if (!isValid) {
      console.log("❌ Validation failed:", error);
      await logActivity(req, PANEL, MODULE, "update", error, false);
      return res.status(400).json({ status: false, ...error });
    }
    console.log("✅ Step 2: Validation passed");

    // Step 3: Call service to update booking
    console.log("🔄 Step 3: Calling BookingTrialService.updateBooking");
    const result = await BookingTrialService.updateBooking(
      payload,
      adminId,
      id
    );

    if (!result || result.status === false) {
      console.log("❌ Booking update failed:", result?.message);
      return res.status(404).json({
        status: false,
        message: result?.message || "Booking update failed.",
      });
    }

    const booking = result.data || result;
    console.log("✅ Step 3: Booking updated successfully:", booking.id);

    // Step 4: Email configuration fetch
    const classSchedule = booking.classSchedule;
    const venue = classSchedule?.venue || {};
    const venueName = venue.venueName || venue?.name || "N/A";

    console.log("🔄 Step 4: Fetching email configuration for book-paid-trial");
    const {
      status: configStatus,
      emailConfig,
      htmlTemplate,
      subject,
    } = await emailModel.getEmailConfig(PANEL, "book-paid-trial");

    console.log("📧 Step 4: Email config loaded:", {
      configStatus,
      subject,
      htmlTemplateLength: htmlTemplate?.length || 0,
    });

    // Step 5: Send emails to parents
    if (configStatus && htmlTemplate) {
      console.log("🔹 Step 5: Sending emails to parents...");
      for (const parent of booking.parents || []) {
        try {
          console.log(`🔹 Preparing email for parent: ${parent.parentEmail}`);

          const htmlBody = htmlTemplate
            .replace(
              /{{parentName}}/g,
              `${parent.parentFirstName} ${parent.parentLastName}`
            )
            .replace(/{{venueName}}/g, venueName)
            .replace(/{{className}}/g, classSchedule?.className || "N/A")
            .replace(
              /{{classTime}}/g,
              `${classSchedule?.startTime || ""} - ${
                classSchedule?.endTime || ""
              }`
            )
            .replace(/{{startDate}}/g, booking.startDate || "")
            .replace(/{{status}}/g, booking.status || "N/A")
            .replace(/{{year}}/g, new Date().getFullYear().toString());

          console.log("📨 Sending email to parent:", parent.parentEmail);

          await sendEmail({
            ...emailConfig,
            to: [
              {
                name: `${parent.parentFirstName} ${parent.parentLastName}`,
                email: parent.parentEmail,
              },
            ],
            subject,
            htmlBody,
          });

          console.log(`✅ Email successfully sent to ${parent.parentEmail}`);
        } catch (err) {
          console.error(
            `❌ Failed to send email to ${parent.parentEmail}:`,
            err.message
          );
        }
      }
    } else {
      console.warn(
        "⚠️ Step 5: Email not sent. Config missing or template empty."
      );
    }

    // Step 6: Log activity
    console.log("🔹 Step 6: Logging activity");
    await logActivity(
      req,
      PANEL,
      MODULE,
      "update",
      { message: `Updated booking ID: ${id}` },
      true
    );

    console.log("✅ Step 7: Completed updateBooking successfully");
    return res.status(200).json({
      status: true,
      message: "Booking updated successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Step 8: Error updating booking:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "update",
      { error: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
