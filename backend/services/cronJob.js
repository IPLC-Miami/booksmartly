const cron = require('node-cron');
const sendReminder = require('./reminderService');

// Twilio credential guard
function checkTwilioCredentials() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[${new Date().toISOString()}] Cron job skipped: Twilio credentials not found in environment.`);
    return false;
  }
  return true;
}

cron.schedule("0 9 * * *", async () => {
    if (!checkTwilioCredentials()) {
      return;
    }
    
    await sendReminder();
  }, {
    timezone: "Asia/Kolkata"
  });

