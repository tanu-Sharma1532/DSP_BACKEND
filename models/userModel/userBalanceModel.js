const mongoose = require('mongoose');
const moment = require('moment-timezone');

const userBalanceWithHistorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wallet_balance: {
        type: Number,
        required: false,
        default: 25
    },
    total_earnings: {
        type: Number,
        required: false,
        default: 0
    },
    last_updated: {
        type: Date,
        default: () => moment().tz('Asia/Kolkata').toDate()
    },
    balance_history: [
        {
            transactionType: {
                type: String,
                enum: ['Credited', 'Debited'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                default: () => moment().tz('Asia/Kolkata').toDate()
            }
        }
    ]
});

module.exports = mongoose.model('UserBalanceWithHistory', userBalanceWithHistorySchema);
