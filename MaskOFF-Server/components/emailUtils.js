// components/emailUtils.js
const { Recipient, EmailParams, MailerSend } = require("mailersend");

const mailersend = new MailerSend({
  apiKey: process.env.MAILER_SEND_API,
});

// Ensure template IDs are correctly loaded and trimmed.
const verifyTemplateId = process.env.VERIFY_TEMPLATE_ID ? process.env.VERIFY_TEMPLATE_ID.trim() : "pr9084zo6xmlw63d";
const forgotTemplateId = process.env.FORGOT_TEMPLATE_ID ? process.env.FORGOT_TEMPLATE_ID.trim() : "your_forgot_template_id";

console.log("Using VERIFY_TEMPLATE_ID:", verifyTemplateId);
console.log("Using FORGOT_TEMPLATE_ID:", forgotTemplateId);

/**
 * Sends a verification email using MailerSend.
 * @param {Object} options - Options for the email.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.toName - Recipient name.
 * @param {string} options.username - Username to include in the email.
 * @param {string} options.verifyUrl - Verification URL to be included.
 * @param {string} options.supportEmail - Support email address to include.
 * @returns {Promise} - Resolves with the result from MailerSend.
 */
const sendVerificationEmail = async ({ to, toName, username, verifyUrl, supportEmail }) => {
  console.log("Sending verification email to:", to);

  const recipients = [new Recipient(to, toName)];
  const personalization = [
    {
      email: to,
      data: {
        username,
        verifyUrl,
        support_email: supportEmail,
      },
    },
  ];

  const emailParams = new EmailParams({
    from: {
      email: process.env.EMAIL_FROM ? process.env.EMAIL_FROM.trim() : "info@domain.com",
      name: process.env.EMAIL_FROM_NAME ? process.env.EMAIL_FROM_NAME.trim() : "Your Name"
    },
    to: recipients,
    subject: "Verify your email address",
    template_id: verifyTemplateId,
    personalization,
  });

  try {
    const result = await mailersend.email.send(emailParams);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Sends a forgot-password email using MailerSend.
 * @param {Object} options - Options for the email.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.toName - Recipient name.
 * @param {string} options.username - Username to include in the email.
 * @param {string} options.resetUrl - Password reset URL to be included.
 * @param {string} options.supportEmail - Support email address to include.
 * @returns {Promise} - Resolves with the result from MailerSend.
 */
const sendForgotPasswordEmail = async ({ to, toName, username, resetUrl, supportEmail }) => {
  console.log("Sending forgot password email to:", to);

  const recipients = [new Recipient(to, toName)];
  const personalization = [
    {
      email: to,
      data: {
        username,
        resetUrl,
        support_email: supportEmail,
      },
    },
  ];

  const emailParams = new EmailParams({
    from: {
      email: process.env.EMAIL_FROM ? process.env.EMAIL_FROM.trim() : "info@domain.com",
      name: process.env.EMAIL_FROM_NAME ? process.env.EMAIL_FROM_NAME.trim() : "Your Name"
    },
    to: recipients,
    subject: "Reset your password",
    template_id: forgotTemplateId,
    personalization,
  });

  try {
    const result = await mailersend.email.send(emailParams);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendForgotPasswordEmail };
