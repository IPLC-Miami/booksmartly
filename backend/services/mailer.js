const nodemailer = require('nodemailer');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

let transporter;

if (process.env.GLOW_LABS_EMAIL && process.env.GLOW_LABS_EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GLOW_LABS_EMAIL,
      pass: process.env.GLOW_LABS_EMAIL_APP_PASSWORD,
    },
  });
} else {
  console.info('[Mailer] Email service disabled – env vars missing');
}

const sendBookingConfirmation = async (to, data) => {
  if (!transporter) {
    console.warn('[Mailer] Cannot send email - service is disabled');
    return Promise.resolve();
  }

  const mjmlTemplate = fs.readFileSync(path.resolve(__dirname, '../emails/bookingConfirmation.mjml'), 'utf8');
  const { html } = mjml2html(mjmlTemplate);

  const mailOptions = {
    from: process.env.GLOW_LABS_EMAIL,
    to,
    subject: 'Booking Confirmation',
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation };