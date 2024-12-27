const mongoose = require('mongoose');
const moment = require('moment-timezone');

const supportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  addedOn: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  }
});

module.exports = mongoose.model('Support', supportSchema);
