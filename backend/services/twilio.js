const twilio = require('twilio');
const client  = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.startVerification = async phone =>
  client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: 'sms' });

exports.checkVerification = async (phone, code) =>
  client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code });

exports.sendSMS = (to, body) =>
  client.messages.create({ to, from: process.env.TWILIO_PHONE_NUMBER, body });