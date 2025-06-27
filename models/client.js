const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currentDate = new Date().toISOString();

const ClientSchema = new Schema({
  squareCustomerId: String,
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  password: String,
  profilePicture: String,
  admin: { type: Boolean, default: false },
  unsavedSquareCardIDs: { type: Array, default: [] },
  tokenCount: { type: Number, default: 0 },
  consentForm: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsentForm' },
  myRoutine: { type: mongoose.Schema.Types.ObjectId, ref: 'MyRoutine' },
  createdAt: { type: Date, default: currentDate },
});

module.exports = mongoose.model("Client", ClientSchema);