const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Offer = require('../adminModel/offerModel');

const leadsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    lead_status: {
        type: String,  // Ensure it's a string
        required: true,
        enum: ["0", "1", "2"],  // Assuming these are the valid statuses
    },
    remarks: { type: String },
    added_on: { type: Date, default: Date.now },
    goals: [
        {
            goal_id: { type: mongoose.Schema.Types.ObjectId, required: true },
            goal_status: { 
                type: Number, 
                required: true, 
                default: 3  // Set initial value to 3 for goal_status
            },
        },
    ],
});

module.exports = mongoose.model('userLead', leadsSchema);
