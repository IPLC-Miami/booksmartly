const nodemailer = require('nodemailer');
const mjml = require('mjml');

let transporter;

if (process.env.GLOW_LABS_EMAIL && process.env.GLOW_LABS_EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GLOW_LABS_EMAIL,
      pass: process.env.GLOW_LABS_EMAIL_APP_PASSWORD,
    },
  });
}

const sendEmail = (mjmlTemplate, to, subject) => {
  if (!transporter) {
    return Promise.resolve();
  }

  const { html } = mjml(mjmlTemplate);

  const mailOptions = {
    from: process.env.GLOW_LABS_EMAIL,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };