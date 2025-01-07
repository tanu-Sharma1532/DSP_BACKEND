const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Offer = require('../adminModel/offerModel')

const leadsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    lead_status: { type: String, default: '0' },
    remarks: { type: String },
    added_on: { type: Date, default: Date.now },
});


module.exports = mongoose.model('userLead',leadsSchema);