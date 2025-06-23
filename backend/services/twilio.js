const twilio = require('twilio');

// Check if Twilio credentials are properly configured
const hasTwilioCredentials = () => {
  return process.env.TWILIO_ACCOUNT_SID &&
         process.env.TWILIO_AUTH_TOKEN &&
         process.env.TWILIO_VERIFY_SERVICE_SID &&
         process.env.TWILIO_PHONE_NUMBER &&
         process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
         process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid_here';
};

// Only initialize client if credentials are available
let client = null;
if (hasTwilioCredentials()) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

exports.startVerification = async phone => {
  if (!client) {
    console.log('Twilio not configured - skipping SMS verification');
    return { status: 'pending', sid: 'mock-verification-sid' };
  }
  return client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: 'sms' });
};

exports.checkVerification = async (phone, code) => {
  if (!client) {
    console.log('Twilio not configured - skipping SMS verification check');
    return { status: 'approved', valid: true };
  }
  return client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code });
};

exports.sendSMS = (to, body) => {
  if (!client) {
    console.log('Twilio not configured - skipping SMS send');
    return Promise.resolve({ sid: 'mock-message-sid', status: 'sent' });
  }
  return client.messages.create({ to, from: process.env.TWILIO_PHONE_NUMBER, body });
};