const bcrypt = require("bcrypt");
const { createToken } = require("../../utils/jwt");
const sendEmail = require("../../utils/email/sendEmail");

const memberModel = require("../../services/member/member");
const emailModel = require("../../services/email");

const DEBUG = process.env.DEBUG === true;

// ✅ Register a new member
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required: name, email, and password." });
  }

  try {
    const { status: exists, data: existingMember } = await memberModel.findMemberByEmail(email);

    if (exists && existingMember) {
      return res.status(409).json({ message: "This email is already registered. Please login or use another email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { status, data, message } = await memberModel.createMember(name, email, hashedPassword);

    if (!status) {
      return res.status(500).json({ message: message || "Failed to register member. Please try again." });
    }

    return res.status(201).json({
      message: "Registration successful. You can now log in.",
      data: { memberId: data.id },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Internal server error during registration. Please try again later." });
  }
};

// ✅ Login member
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Both email and password are required." });
  }

  try {
    const { status, data: member } = await memberModel.findMemberByEmail(email);

    if (!status || !member || !(await bcrypt.compare(password, member.password))) {
      return res.status(401).json({ message: "Invalid email or password. Please try again." });
    }

    const token = createToken({
      id: member.id,
      name: member.name,
      email: member.email,
    });

    return res.status(200).json({
      message: "Login successful.",
      data: { memberId: member.id, token },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "Internal server error during login. Please try again later." });
  }
};

// ✅ Verify token validity
exports.verifyLogin = async (req, res) => {
  try {
    return res.status(200).json({
      status: true,
      message: "Login verified successfully.",
      member: req.member,
    });
  } catch (error) {
    console.error("❌ Verify Login Error:", error);
    return res.status(500).json({ status: false, message: "Error verifying login. Please try again." });
  }
};

// ✅ Get member profile
exports.profile = async (req, res) => {
  try {
    console.log(`req.member - `, req.member);
    const { status, data: member } = await memberModel.getMemberById(req.member.id);

    if (!status || !member) {
      return res.status(404).json({ message: "Member not found." });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully.",
      profile: {
        id: member.id,
        name: member.name,
        email: member.email,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    return res.status(500).json({ message: "Unable to retrieve profile. Please try again later." });
  }
};

// ✅ Send OTP for password reset
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const { status, data: member } = await memberModel.findMemberByEmail(email);

    if (!status || !member) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otpResult = await memberModel.saveOtpToMember(member.id, otp, expiry);
    if (!otpResult.status) {
      return res.status(500).json({ message: "Failed to save OTP. Please try again later." });
    }

    const emailConfigResult = await emailModel.getEmailConfig("member", "forgot-password");
    const { emailConfig, htmlTemplate, subject, message: configMessage } = emailConfigResult;

    if (!emailConfigResult.status || !emailConfig) {
      return res.status(503).json({ message: configMessage || "Failed to load email configuration." });
    }

    const replacements = {
      "{{name}}": member.name || "",
      "{{email}}": member.email || "",
      "{{otp}}": otp,
      "{{otpEpiry}}": expiry.toLocaleString(),
      "{{year}}": new Date().getFullYear().toString(),
      "{{appName}}": "Synco",
    };

    const replacePlaceholders = (text) => {
      if (typeof text !== "string") return text;
      return Object.entries(replacements).reduce((result, [key, val]) => result.replace(new RegExp(key, "g"), val), text);
    };

    const emailSubject = replacePlaceholders(subject || "Your OTP Code");
    let htmlBody = replacePlaceholders(
      htmlTemplate?.trim() || `<p>Dear {{name}},</p><p>Your OTP is <strong>{{otp}}</strong>. It expires at {{otpEpiry}}.</p>`
    );

    const mapRecipients = (list) =>
      Array.isArray(list)
        ? list.map(({ name, email }) => ({
          name: replacePlaceholders(name),
          email: replacePlaceholders(email),
        }))
        : [];

    const mailData = {
      recipient: mapRecipients(emailConfig.to),
      cc: mapRecipients(emailConfig.cc),
      bcc: mapRecipients(emailConfig.bcc),
      subject: emailSubject,
      htmlBody,
      attachments: [],
    };

    const emailResult = await sendEmail(emailConfig, mailData);

    if (!emailResult.status) {
      return res.status(500).json({ message: "Failed to send OTP email.", error: emailResult.error });
    }

    return res.status(200).json({ message: "OTP sent successfully to your registered email." });
  } catch (error) {
    console.error("❌ Forget Password Error:", error);
    return res.status(500).json({ message: "An error occurred while sending OTP. Please try again later." });
  }
};

// ✅ Reset password using OTP
exports.verifyOtpAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required." });
  }

  try {
    const { status, data: member } = await memberModel.findMemberByEmailAndValidOtp(email, otp);

    if (!status || !member) {
      return res.status(400).json({ message: "The OTP is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const resetResult = await memberModel.updatePasswordAndClearOtp(member.id, hashedPassword);

    if (!resetResult.status) {
      return res.status(500).json({ message: "Failed to reset password. Please try again." });
    }

    return res.status(200).json({ message: "Password has been reset successfully. You may now log in with the new password." });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    return res.status(500).json({ message: "Error occurred while resetting the password. Please try again later." });
  }
};
