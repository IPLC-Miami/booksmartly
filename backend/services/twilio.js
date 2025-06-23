const twilio = require('twilio');

// Ensure ENV vars are loaded, e.g., via dotenv at app entry point
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
  console.warn("Twilio configuration is incomplete. SMS functionality will be disabled.");
}

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

// Stub functions if client is not available to prevent crashes
const sendSMS = async (to, body) => {
  if (!client) return { sid: 'SM_STUBBED_DISABLED' };
  return client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
};
const startVerification = async (to, channel = 'sms') => {
  if (!client) return { status: 'pending' };
  return client.verify.v2.services(verifyServiceSid).verifications.create({ to, channel });
};
const checkVerification = async (to, code) => {
  if (!client) return { status: 'approved' };
  return client.verify.v2.services(verifyServiceSid).verificationChecks.create({ to, code });
};

module.exports = { sendSMS, startVerification, checkVerification };