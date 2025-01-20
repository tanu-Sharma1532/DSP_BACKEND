const mongoose = require('mongoose');

const userBalanceSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    wallet_balance: { type: Number, required: true },
    total_earnings: { type: Number, required: true },
    wheel_earnings: { type: Number, required: true },
    last_updated: { type: Date, required: true },
    coins: { type: Number, required: true },
    balance_history: [{
        transactionType: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        source: { 
            type: Map, 
            of: mongoose.Schema.Types.Mixed,  // Allows storing mixed types (e.g., objects)
            required: true
        }
    }],
    goals: [{
        offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
        goal_name: { type: String, required: true },
        goal_payout: { type: Number, required: true },
        completed_on: { type: Date, required: false }  // Make completed_on optional
    }]
});

const UserBalanceWithHistory = mongoose.model('UserBalanceWithHistory', userBalanceSchema);

module.exports = UserBalanceWithHistory;
