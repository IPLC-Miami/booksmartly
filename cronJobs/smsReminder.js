const cron = require('node-cron');

function registerTwilioReminderJob() {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    // Schedule task to run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      console.log('Running daily SMS reminder job...');
      // Add your Twilio logic here, e.g.,:
      // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // client.messages.create({ ... });
    });
  } else {
    console.info('[Cron] Twilio SMS reminder job disabled – env vars missing');
  }
}

registerTwilioReminderJob();

module.exports = { registerTwilioReminderJob };