const cron = require('node-cron');

// Twilio credential guard
function checkTwilioCredentials() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[${new Date().toISOString()}] Cron job skipped: Twilio credentials not found in environment.`);
    return false;
  }
  return true;
}

function registerTwilioReminderJob() {
    // Schedule task to run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      if (!checkTwilioCredentials()) {
        return;
      }
      
      console.log('Running daily SMS reminder job...');
      // Add your Twilio logic here, e.g.,:
      // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // client.messages.create({ ... });
    });
}

registerTwilioReminderJob();

module.exports = { registerTwilioReminderJob };