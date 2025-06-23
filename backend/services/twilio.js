const twilio = require('twilio');

// Returns a no-op Twilio client that logs warnings and returns mock responses
const createNoOpTwilioClient = () => {
  console.info('[Twilio] Twilio service disabled – env vars missing');
  return {
    messages: {
      create: () => {
        console.warn('[Twilio] Cannot send SMS - service is disabled');
        return Promise.resolve({ sid: 'mock-message-sid' });
      },
    },
    verify: {
      v2: {
        services: () => ({
          verifications: {
            create: () => {
              console.warn('[Twilio] Cannot create verification - service is disabled');
              return Promise.resolve({ sid: 'mock-verification-sid', status: 'pending' });
            },
          },
          verificationChecks: {
            create: () => {
              console.warn('[Twilio] Cannot check verification - service is disabled');
              return Promise.resolve({ sid: 'mock-check-sid', status: 'approved' });
            },
          },
        }),
      },
    },
  };
};

// Returns a real Twilio client
const createTwilioClient = () => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.info('[Twilio] Initialized with account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 8) + '...');
  return client;
};

// Create a real Twilio client only if credentials are set, otherwise create a no-op client
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? createTwilioClient()
  : createNoOpTwilioClient();

// Helper function to send SMS
const sendSMS = async (to, body, from = process.env.TWILIO_PHONE_NUMBER) => {
  try {
    const message = await twilioClient.messages.create({
      body,
      from,
      to,
    });
    console.info(`[Twilio] SMS sent to ${to}, SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('[Twilio] SMS sending failed:', error);
    throw error;
  }
};

// Helper function to start phone verification
const startVerification = async (phoneNumber, channel = 'sms') => {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    console.warn('[Twilio] Cannot start verification - TWILIO_VERIFY_SERVICE_SID missing');
    return { sid: 'mock-verification-sid', status: 'pending' };
  }

  try {
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel,
      });
    
    console.info(`[Twilio] Verification started for ${phoneNumber}, SID: ${verification.sid}`);
    return verification;
  } catch (error) {
    console.error('[Twilio] Verification start failed:', error);
    throw error;
  }
};

// Helper function to check phone verification
const checkVerification = async (phoneNumber, code) => {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    console.warn('[Twilio] Cannot check verification - TWILIO_VERIFY_SERVICE_SID missing');
    return { sid: 'mock-check-sid', status: 'approved' };
  }

  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });
    
    console.info(`[Twilio] Verification check for ${phoneNumber}, status: ${verificationCheck.status}`);
    return verificationCheck;
  } catch (error) {
    console.error('[Twilio] Verification check failed:', error);
    throw error;
  }
};

// Helper function to send appointment reminder
const sendAppointmentReminder = async (phoneNumber, appointmentDetails) => {
  const { clientName, date, time, service } = appointmentDetails;
  const message = `Hi ${clientName}! This is a reminder for your ${service} appointment on ${date} at ${time}. Reply STOP to opt out.`;
  
  return sendSMS(phoneNumber, message);
};

// Helper function to send booking confirmation
const sendBookingConfirmation = async (phoneNumber, bookingDetails) => {
  const { clientName, date, time, service } = bookingDetails;
  const message = `Hi ${clientName}! Your ${service} appointment is confirmed for ${date} at ${time}. We look forward to seeing you!`;
  
  return sendSMS(phoneNumber, message);
};

module.exports = {
  twilioClient,
  sendSMS,
  startVerification,
  checkVerification,
  sendAppointmentReminder,
  sendBookingConfirmation,
};