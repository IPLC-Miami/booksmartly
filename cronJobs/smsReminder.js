const cron = require('node-cron');

if (!process.env.TWILIO_ACCOUNT_SID) {
  console.log(`[${new Date().toISOString()}] Cron job skipped: TWILIO_ACCOUNT_SID not found in environment.`);
  process.exit(0);
}

function registerTwilioReminderJob() {
    // Schedule task to run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      console.log('Running daily SMS reminder job...');
      // Add your Twilio logic here, e.g.,:
      // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // client.messages.create({ ... });
    });
}

registerTwilioReminderJob();

module.exports = { registerTwilioReminderJob };