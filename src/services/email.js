const { EmailConfig } = require("../models");

/**
 * Get an active email configuration by module and action.
 */
exports.getEmailConfig = async (module, action, status = true) => {
  try {
    console.log(
      `Fetching email configuration for module: ${module}, action: ${action}, status: ${status}`
    );

    const emailConfig = await EmailConfig.findOne({
      where: {
        module,
        action,
        status: true,
      },
    });

    if (!emailConfig) {
      return { status: false, message: "Email configuration not found" };
    }

    let to = [];
    let cc = [];
    let bcc = [];

    try {
      if (typeof emailConfig.to === "string") to = JSON.parse(emailConfig.to);
    } catch (e) {
      console.error("Invalid JSON in emailConfig.to:", e);
    }

    try {
      if (typeof emailConfig.cc === "string") cc = JSON.parse(emailConfig.cc);
    } catch (e) {
      console.error("Invalid JSON in emailConfig.cc:", e);
    }

    try {
      if (typeof emailConfig.bcc === "string")
        bcc = JSON.parse(emailConfig.bcc);
    } catch (e) {
      console.error("Invalid JSON in emailConfig.bcc:", e);
    }

    const config = {
      host: emailConfig.smtp_host,
      port: emailConfig.smtp_port,
      secure: emailConfig.smtp_secure,
      username: emailConfig.smtp_username,
      password: emailConfig.smtp_password,
      from_email: emailConfig.from_email,
      from_name: emailConfig.from_name,
      to,
      cc,
      bcc,
    };

    return {
      status: true,
      emailConfig: config,
      htmlTemplate: emailConfig.html_template,
      subject: emailConfig.subject,
    };
  } catch (error) {
    console.error(
      `Error fetching email configuration for module "${module}", action "${action}":`,
      error
    );
    return { status: false, message: "Error fetching email configuration" };
  }
};
