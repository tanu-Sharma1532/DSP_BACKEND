const mongoose = require('mongoose');
const moment = require('moment-timezone');

const transactionHistory = new mongoose.Schema({
    user_id:
    {
        type:mongoose.Schema.Types.ObjectId,ref:"User",required:true
    },
    transaction_type:
    {
        type:String,required:true
    },
    transfer_id:
    {
        type:String,required:false
    },
    payout_id:
    {
        type:String,required:false
    },
    status:
    {
        type:String,required:false
    },
    amount:
    {
        type:String,required:true
    },
    added_on:
    {
        type:Date, default : () =>moment().tz('Asia/Kolkata').toDate()
    }

});

module.exports = mongoose.model('transaction_history',transactionHistory);