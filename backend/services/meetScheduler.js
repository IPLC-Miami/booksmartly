const {google} = require('googleapis')
const oauth2client = require('../config/googleClient')
const calendar = google.calendar({
    version: 'v3',
    auth: oauth2client,
});
const {v4: uuid} = require('uuid');
const event = {
    summary: "Online Appointment with Doctor",
    location: "Online Meet",

    description: "Online Appointment booked with doctor through BookSmartly",
    start: {
        dateTime: "",
        timeZone: "Asia/Kolkata",
    },
    end: {
        dateTime: "",
        timeZone: "Asia/Kolkata",
    },
    conferenceData: {
        createRequest: {
            requestId: uuid(),
        }
    },

    attendees: [
        {email: ''},
    ]   
};

module.exports = {event , calendar}
