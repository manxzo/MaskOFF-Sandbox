// components/emailUtils.js
const { Recipient, EmailParams, MailerSend } = require("mailersend");

const mailersend = new MailerSend({
  apiKey: process.env.MAILER_SEND_API,
});

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

  const emailParams = new EmailParams()
    .setFrom(process.env.EMAIL_FROM || "info@domain.com")
    .setFromName(process.env.EMAIL_FROM_NAME || "Your Name")
    .setRecipients(recipients)
    .setSubject("Verify your email address")
    .setTemplateId(process.env.VERIFY_TEMPLATE_ID || "pr9084zo6xmlw63d")
    .setPersonalization(personalization);

  try {
    const result = await mailersend.send(emailParams);
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

  const emailParams = new EmailParams()
    .setFrom(process.env.EMAIL_FROM || "info@domain.com")
    .setFromName(process.env.EMAIL_FROM_NAME || "Your Name")
    .setRecipients(recipients)
    .setSubject("Reset your password")
    .setTemplateId(process.env.FORGOT_TEMPLATE_ID || "your_forgot_template_id")
    .setPersonalization(personalization);

  try {
    const result = await mailersend.send(emailParams);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendForgotPasswordEmail };
