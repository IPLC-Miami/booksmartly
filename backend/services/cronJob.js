const cron = require('node-cron');
const sendReminder = require('./reminderService');

cron.schedule("0 9 * * *", async () => {
    await sendReminder();
  }, {
    timezone: "Asia/Kolkata"
  });

