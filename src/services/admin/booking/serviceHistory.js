const {
  sequelize,
  Booking,
  BookingStudentMeta,
  BookingParentMeta,
  BookingEmergencyMeta,
  ClassSchedule,
  Venue,
  PaymentPlan,
  Admin,
  BookingPayment,
} = require("../../../models");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { getEmailConfig } = require("../../email");
const sendEmail = require("../../../utils/email/sendEmail");

exports.getBookingById = async (id, adminId) => {
  try {
    const booking = await Booking.findOne({
      where: { id },
      include: [
        {
          model: BookingStudentMeta,
          as: "students",
          required: false,
          include: [
            { model: BookingParentMeta, as: "parents", required: false },
            {
              model: BookingEmergencyMeta,
              as: "emergencyContacts",
              required: false,
            },
          ],
        },
        {
          model: ClassSchedule,
          as: "classSchedule",
          required: false,
          include: [{ model: Venue, as: "venue", required: false }],
        },
        {
          model: Admin, // ✅ Include bookedBy admin
          as: "bookedByAdmin",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "roleId",
            "status",
            "profile",
          ],
          required: false,
        },
      ],
    });

    if (!booking) {
      return { status: false, message: "Booking not found or not authorized." };
    }

    // Handle payment plans
    let paymentPlans = [];
    let paymentPlanIds = [];

    const venue = booking.classSchedule?.venue;
    if (venue?.paymentPlanId) {
      if (typeof venue.paymentPlanId === "string") {
        try {
          paymentPlanIds = JSON.parse(venue.paymentPlanId);
        } catch {
          console.warn("⚠️ Failed to parse venue.paymentPlanId");
        }
      } else if (Array.isArray(venue.paymentPlanId)) {
        paymentPlanIds = venue.paymentPlanId;
      }

      paymentPlanIds = paymentPlanIds
        .map((id) => parseInt(id, 10))
        .filter(Boolean);

      if (paymentPlanIds.length) {
        paymentPlans = await PaymentPlan.findAll({
          where: { id: paymentPlanIds },
        });
      }
    }

    // Extract students
    const students =
      booking.students?.map((s) => ({
        studentFirstName: s.studentFirstName,
        studentLastName: s.studentLastName,
        dateOfBirth: s.dateOfBirth,
        age: s.age,
        gender: s.gender,
        medicalInformation: s.medicalInformation,
      })) || [];

    // Extract parents from first student
    const parents =
      booking.students?.[0]?.parents?.map((p) => ({
        parentFirstName: p.parentFirstName,
        parentLastName: p.parentLastName,
        parentEmail: p.parentEmail,
        parentPhoneNumber: p.parentPhoneNumber,
        relationToChild: p.relationToChild,
        howDidYouHear: p.howDidYouHear,
      })) || [];

    // Extract emergency contacts from first student
    const emergency =
      booking.students?.[0]?.emergencyContacts?.map((e) => ({
        emergencyFirstName: e.emergencyFirstName,
        emergencyLastName: e.emergencyLastName,
        emergencyPhoneNumber: e.emergencyPhoneNumber,
        emergencyRelation: e.emergencyRelation,
      })) || [];

    // Final response
    const response = {
      id: booking.id,
      bookingId: booking.bookingId,
      classScheduleId: booking.classScheduleId,
      trialDate: booking.trialDate,
      bookedBy: booking.bookedByAdmin || null, // ✅ full admin object
      className: booking.className,
      classTime: booking.classTime,
      venueId: booking.venueId,
      status: booking.status,
      totalStudents: booking.totalStudents,
      source: booking.source,
      createdAt: booking.createdAt,

      students,
      parents,
      emergency,

      classSchedule: booking.classSchedule || {},
      paymentPlans,
    };

    return {
      status: true,
      message: "Fetched booking details successfully.",
      data: response,
    };
  } catch (error) {
    console.error("❌ getBookingById Error:", error.message);
    return { status: false, message: error.message };
  }
};

exports.updateBooking = async (payload, adminId, id) => {
  const t = await sequelize.transaction();
  try {
    if (!id) throw new Error("Booking ID is required.");

    // 🔹 Step 1: Fetch existing booking
    const booking = await Booking.findOne({
      where: { id },
      include: [
        {
          model: ClassSchedule,
          as: "classSchedule",
          include: [{ model: Venue, as: "venue" }],
        },
        {
          model: BookingStudentMeta,
          as: "students",
          include: [
            { model: BookingParentMeta, as: "parents" },
            { model: BookingEmergencyMeta, as: "emergencyContacts" },
          ],
        },
      ],
      transaction: t,
    });

    if (!booking) throw new Error("Booking not found.");

    // 🔹 Step 2: Update main booking fields
    const updateFields = [
      "totalStudents",
      "startDate",
      "paymentPlanId",
      "keyInformation",
      "classScheduleId",
      "venueId",
    ];
    updateFields.forEach((field) => {
      if (payload[field] !== undefined) booking[field] = payload[field];
    });

    // ✅ Fix bookingType and status
    booking.bookingType = "paid";
    booking.status = "active";

    // Remove trialDate if present
    booking.trialDate = null;
    booking.bookedBy = adminId || booking.bookedBy;

    await booking.save({ transaction: t });

    // 🔹 Step 3: Update existing students, parents, emergency contacts only
    if (Array.isArray(payload.students)) {
      for (const student of payload.students) {
        if (!student.id) continue;
        const studentRecord = booking.students.find((s) => s.id === student.id);
        if (!studentRecord) continue;

        Object.assign(studentRecord, student);
        await studentRecord.save({ transaction: t });

        // Update parents
        if (Array.isArray(student.parents)) {
          for (const parent of student.parents) {
            if (!parent.id) continue;
            const parentRecord = studentRecord.parents.find(
              (p) => p.id === parent.id
            );
            if (parentRecord) {
              Object.assign(parentRecord, parent);
              await parentRecord.save({ transaction: t });
            }
          }
        }

        // Update emergency contacts
        if (Array.isArray(student.emergencyContacts)) {
          for (const emergency of student.emergencyContacts) {
            if (!emergency.id) continue;
            const emergencyRecord = studentRecord.emergencyContacts.find(
              (e) => e.id === emergency.id
            );
            if (emergencyRecord) {
              Object.assign(emergencyRecord, emergency);
              await emergencyRecord.save({ transaction: t });
            }
          }
        }
      }
    }

    // 🔹 Step 4: Process Payment ONCE per booking
    if (booking.paymentPlanId && payload.payment?.paymentType) {
      const paymentType = payload.payment.paymentType; // "rrn" or "card"
      console.log("Step 4: Start payment process, paymentType:", paymentType);

      let paymentStatusFromGateway = "pending";
      const firstStudentId = booking.students[0]?.id;

      // Fetch payment plan & pricing
      const paymentPlan = await PaymentPlan.findByPk(booking.paymentPlanId, {
        transaction: t,
      });
      if (!paymentPlan) throw new Error("Invalid payment plan selected.");
      const price = paymentPlan.price || 0;

      // Fetch venue & classSchedule info
      const venue = await Venue.findByPk(payload.venueId, { transaction: t });
      const classSchedule = await ClassSchedule.findByPk(
        payload.classScheduleId,
        { transaction: t }
      );

      const merchantRef = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
      let gatewayResponse = null;
      const amountInPence = Math.round(price * 100);

      try {
        if (paymentType === "rrn") {
          if (!payload.payment.referenceId)
            throw new Error("Reference ID is required for RRN payments.");

          const gcPayload = {
            cardHolderName: null,
            cv2: null,
            expiryDate: null,
            pan: null,
            billing_requests: {
              payment_request: {
                description: `${venue?.name || "Venue"} - ${
                  classSchedule?.className || "Class"
                }`,
                amount: Math.round(price * 100),
                scheme: "faster_payments",
                currency: "GBP",
                metadata: { referenceId: payload.payment.referenceId },
              },
              mandate_request: {
                currency: "GBP",
                scheme: "bacs",
                verify: "recommended",
                metadata: { referenceId: payload.payment.referenceId },
              },
              links: {},
              metadata: { test: `BR${Math.floor(Math.random() * 1000000)}` },
            },
          };

          const response = await axios.post(
            "https://api-sandbox.gocardless.com/billing_requests",
            gcPayload,
            {
              headers: {
                Authorization: `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "GoCardless-Version": "2015-07-06",
              },
            }
          );

          gatewayResponse = response.data;
          paymentStatus = "SUCCESS"; // Save as SUCCESS for RRN
        } else if (paymentType === "card") {
          if (
            !process.env.PAY360_INST_ID ||
            !process.env.PAY360_API_USERNAME ||
            !process.env.PAY360_API_PASSWORD
          )
            throw new Error("Pay360 credentials not set.");

          const paymentPayload = {
            transaction: {
              currency: "GBP",
              amount: price,
              merchantRef,
              description: `${venue?.name || "Venue"} - ${
                classSchedule?.className || "Class"
              }`,
              commerceType: "ECOM",
            },
            paymentMethod: {
              card: {
                pan: payload.payment.pan,
                expiryDate: payload.payment.expiryDate,
                cardHolderName: payload.payment.cardHolderName,
                cv2: payload.payment.cv2,
              },
            },
          };

          const url = `https://api.mite.pay360.com/acceptor/rest/transactions/${process.env.PAY360_INST_ID}/payment`;
          const authHeader = Buffer.from(
            `${process.env.PAY360_API_USERNAME}:${process.env.PAY360_API_PASSWORD}`
          ).toString("base64");

          const response = await axios.post(url, paymentPayload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${authHeader}`,
            },
          });

          gatewayResponse = response.data;
          const txnStatus = response.data?.transaction?.status?.toLowerCase();
          if (["success", "paid"].includes(txnStatus))
            paymentStatus = "SUCCESS";
          else if (txnStatus === "pending") paymentStatus = "PENDING";
          else if (txnStatus === "declined") paymentStatus = "FAILED";
          else paymentStatus = txnStatus || "UNKNOWN";
        }

        // 🔹 Save payment
        await BookingPayment.create(
          {
            bookingId: booking.id,
            paymentPlanId: booking.paymentPlanId,
            studentId: firstStudentId,
            paymentType,
            firstName: payload.payment.firstName || "",
            lastName: payload.payment.lastName || "",
            email: payload.payment.email || "",
            billingAddress: payload.payment.billingAddress || "",
            cardHolderName:
              paymentType === "card" ? payload.payment.cardHolderName : null,
            cv2: paymentType === "card" ? payload.payment.cv2 : null,
            expiryDate:
              paymentType === "card" ? payload.payment.expiryDate : null,
            pan: paymentType === "card" ? payload.payment.pan : null,
            referenceId: payload.payment.referenceId || "",
            paymentStatus,
            currency: "GBP",
            merchantRef:
              paymentType === "rrn" ? payload.payment.referenceId : merchantRef,
            description: `${venue?.name || "Venue"} - ${
              classSchedule?.className || "Class"
            }`,
            commerceType: "ECOM",
            gatewayResponse,
            transactionMeta: { status: paymentStatus },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction: t }
        );

        console.log(
          `${paymentType.toUpperCase()} payment saved with status:`,
          paymentStatus
        );
        if (paymentStatus === "FAILED")
          throw new Error("Payment failed. Booking not created.");
      } catch (err) {
        // 🔹 Detailed gateway error handling
        await t.rollback();
        let errorMessage = "Payment failed";
        if (err.response?.data) {
          if (typeof err.response.data === "string")
            errorMessage = err.response.data;
          else if (err.response.data.reasonMessage)
            errorMessage = err.response.data.reasonMessage;
          else if (err.response.data.error?.message)
            errorMessage = err.response.data.error.message;
          else errorMessage = JSON.stringify(err.response.data);
        } else if (err.message) errorMessage = err.message;
        return { status: false, message: errorMessage };
      }
    }

    await t.commit();
    // 🔹 Step 5: Return updated booking
    return await Booking.findOne({
      where: { id },
      include: [
        {
          model: ClassSchedule,
          as: "classSchedule",
          include: [{ model: Venue, as: "venue" }],
        },
        {
          model: BookingStudentMeta,
          as: "students",
          include: [
            { model: BookingParentMeta, as: "parents" },
            { model: BookingEmergencyMeta, as: "emergencyContacts" },
          ],
        },
      ],
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ updateBooking Error:", error.message);
    return { status: false, message: error.message };
  }
};

exports.updateBookingStudents = async (req, res) => {
  const bookingId = req.body.bookingId || req.params.bookingId;
  const studentsPayload = req.body.students || [];

  if (!bookingId) {
    return res.status(400).json({
      status: false,
      message: "Booking ID is required (body.bookingId | params.bookingId).",
    });
  }

  const t = await sequelize.transaction();
  try {
    // 🔹 Step 1: Fetch booking with students, parents, and emergency contacts
    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [
        {
          model: BookingStudentMeta,
          as: "students",
          include: [
            { model: BookingParentMeta, as: "parents" },
            { model: BookingEmergencyMeta, as: "emergencyContacts" },
          ],
        },
      ],
      transaction: t,
    });

    if (!booking) throw new Error("Booking not found.");

    // 🔹 Step 2: Update students, parents, and emergency contacts
    for (const student of studentsPayload) {
      if (!student.id) continue;

      const studentRecord = booking.students.find((s) => s.id === student.id);
      if (!studentRecord) continue;

      // Update student fields
      const studentFields = [
        "studentFirstName",
        "studentLastName",
        "dateOfBirth",
        "age",
        "gender",
        "medicalInformation",
      ];
      studentFields.forEach((field) => {
        if (student[field] !== undefined) studentRecord[field] = student[field];
      });
      await studentRecord.save({ transaction: t });

      // Update parents
      if (Array.isArray(student.parents)) {
        for (const parent of student.parents) {
          if (!parent.id) continue;
          const parentRecord = studentRecord.parents.find((p) => p.id === parent.id);
          if (parentRecord) {
            const parentFields = [
              "parentFirstName",
              "parentLastName",
              "parentEmail",
              "parentPhoneNumber",
              "relationToChild",
              "howDidYouHear",
            ];
            parentFields.forEach((field) => {
              if (parent[field] !== undefined) parentRecord[field] = parent[field];
            });
            await parentRecord.save({ transaction: t });
          }
        }
      }

      // Update emergency contacts
      if (Array.isArray(student.emergencyContacts)) {
        for (const emergency of student.emergencyContacts) {
          if (!emergency.id) continue;
          const emergencyRecord = studentRecord.emergencyContacts.find((e) => e.id === emergency.id);
          if (emergencyRecord) {
            const emergencyFields = [
              "emergencyFirstName",
              "emergencyLastName",
              "emergencyPhoneNumber",
              "emergencyRelation",
            ];
            emergencyFields.forEach((field) => {
              if (emergency[field] !== undefined) emergencyRecord[field] = emergency[field];
            });
            await emergencyRecord.save({ transaction: t });
          }
        }
      }
    }

    await t.commit();
    return res.status(200).json({
      status: true,
      message: "Student, parent, and emergency contact data updated successfully.",
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ updateBookingStudents Error:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};
