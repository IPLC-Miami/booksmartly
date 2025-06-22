const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currentDate = new Date().toISOString();

const AppointmentSchema = new Schema({
  date: String,
  startTime: String,
  morningOrEvening: String,
  endTime: String,
  duration: Number,
  price: Number,
  createdAt: { type: Date, default: currentDate },
  bookedWithCardSquareID: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  esthetician: String,
  treatments: [{ name: String, price: Number, duration: Number }],
  addOns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' }],
  confirmed: { type: Boolean, default: false },
  notes: String,
});

module.exports = mongoose.model("Appointment", AppointmentSchema);