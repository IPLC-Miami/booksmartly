const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.startVerification = async phone => { … }
exports.checkVerification = async (phone, code) => { … }
exports.sendSMS              = async (to, body) => { … }
exports.sendBookingConfirmation = async (phone, booking) => { … }
exports.sendAppointmentReminder  = async (phone, appt) => { … }