const nodemailer = require('nodemailer');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

// Returns a no-op mailer that logs a warning and resolves immediately.
const createNoOpMailer = () => {
  console.info('[Mailer] Email service disabled – env vars missing');
  return {
    sendMail: () => {
      console.warn('[Mailer] Cannot send email - service is disabled');
      return Promise.resolve();
    },
  };
};

// Returns a real nodemailer transporter.
const createMailer = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GLOW_LABS_EMAIL,
    pass: process.env.GLOW_LABS_EMAIL_APP_PASSWORD,
  },
});

// Create a real mailer only if credentials are set, otherwise create a no-op mailer.
const mailer = (process.env.GLOW_LABS_EMAIL && process.env.GLOW_LABS_EMAIL_APP_PASSWORD)
  ? createMailer()
  : createNoOpMailer();

const sendMail = (options) => mailer.sendMail(options);

const sendBookingConfirmation = async (to, data) => {
  const mjmlTemplate = fs.readFileSync(path.resolve(__dirname, '../emails/bookingConfirmation.mjml'), 'utf8');
  // NOTE: `data` is not used in the template, but is kept for compatibility
  const { html } = mjml2html(mjmlTemplate);

  return sendMail({
    from: process.env.GLOW_LABS_EMAIL,
    to,
    subject: 'Booking Confirmation',
    html,
  });
};

module.exports = {
  sendMail,
  sendBookingConfirmation,
};