const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'executive'], 
        default: 'admin' 
    },
    otp: { type: Number },
    otpExpiry: { type: Date },
    accessToken: { type: String },
});

module.exports = mongoose.model('Admin', adminSchema);
