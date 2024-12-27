const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['executive', 'manager'],
        required: true
    },
    createdOn: {
        type: Date,
        default: () => moment().tz('Asia/Kolkata').toDate()
    }
});

module.exports = mongoose.model('Admin', adminSchema);
