const express = require('express');

const UserBalance = require('../../models/userModel/userBalanceModel');
const User = require('../../models/userModel/userModel');
const mongoose = require('mongoose');

exports.updateUserBalance = async (req, res) => {
    try {
        const { userId, amount, transactionType } = req.body; // Get user ID, amount, and transaction type from request body
        
        if (!['Credited', 'Debited'].includes(transactionType)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction type' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find or create a user balance document
        let userBalance = await UserBalance.findOne({ user_id: userId });
        if (!userBalance) {
            userBalance = new UserBalance({
                user_id: userId,
                wallet_balance: 25,  // Set default balance
                total_earnings: 0    // Set default earnings
            });
        }

        // Update the wallet balance based on the transaction type
        if (transactionType === 'Credited') {
            userBalance.wallet_balance += amount;
            userBalance.total_earnings += amount;  // Assuming the credited amount goes to earnings too
        } else if (transactionType === 'Debited') {
            if (userBalance.wallet_balance < amount) {
                return res.status(400).json({ success: false, message: 'Insufficient balance' });
            }
            userBalance.wallet_balance -= amount;
        }

        // Add the transaction to the balance history
        userBalance.balance_history.push({
            transactionType: transactionType,
            amount: amount,
            date: new Date()
        });

        // Save the updated user balance document
        await userBalance.save();

        // Return the updated balance and earnings
        res.status(200).json({
            success: true,
            balance: userBalance.wallet_balance,
            coins: userBalance.total_earnings,
            message: `Balance ${transactionType.toLowerCase()} successfully`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getBalanceHistory = async (req, res) => {
    try {
        const user_id = new mongoose.Types.ObjectId(req.userId);

        // Find the user's balance document with history
        const userBalance = await UserBalance.findOne({ user_id });

        if (!userBalance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        // Return the balance history
        res.status(200).json({
            success: true,
            balanceHistory: userBalance.balance_history
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getUserBalance = async (req, res) => {
    try {
        const user_id = new mongoose.Types.ObjectId(req.userId);
        const user = await User.findById({ _id: user_id });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User Not Found' });
        }

        const user_balance = await UserBalance.findOne({ user_id });

        if (!user_balance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        res.status(200).json({
            success: true,
            balance: user_balance.wallet_balance,
            coins: user_balance.total_earnings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



