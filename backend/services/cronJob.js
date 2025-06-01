const cron = require('node-cron');
const sendReminder = require('./reminderService');

cron.schedule("0 9 * * *", async () => {
    console.log("Running daily reminder job...");
    await sendReminder();
  }, {
    timezone: "Asia/Kolkata"
  });

