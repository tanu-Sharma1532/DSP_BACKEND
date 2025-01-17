const mongoose = require('mongoose');
const moment = require('moment-timezone');

const date = moment().tz('Asia/Kolkata').toDate();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  firebaseToken: { type: String, required: false },
  createdOn: { type: Date, required: false, default: () => date },
  userStatus: { type: Boolean, required: false, default: true },
  state: { type: String, required: false },
  city: { type: String, required: false },
  pincode: { type: String, required: false, minlength: 6, maxlength: 6 },
  referralCode: { type: String, required: false },
  account_deleted: { type: Boolean, required: false, default: false },
  otp: { type: String, required: false },
  otpExpiry: { type: Date, required: false },
  gender:{type: String, required: false}
});

module.exports = mongoose.model('User', userSchema);
