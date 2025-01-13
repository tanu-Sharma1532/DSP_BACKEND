const express = require('express');

const UserBalance = require('../../models/userModel/userBalanceModel');
const User = require('../../models/userModel/userModel');
const Offer = require('../../models/adminModel/offerModel');
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
            earnings: user_balance.total_earnings,
            coins: user_balance.coins
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateUserCoins = async (req, res) => {
    try {
        const { user_id, coins } = req.body;

        // Validate input
        if (!user_id || coins === undefined || typeof coins !== 'number') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid input: user_id and a numeric coins value are required.' 
            });
        }

        // Find and update the user's coins
        const result = await UserBalance.findOneAndUpdate(
            { user_id }, // Find the user by their user_id
            { $inc: { coins } }, // Increment the coins field by the provided value
            { new: true } // Return the updated document
        );

        if (result) {
            return res.status(200).json({ success: true, updatedCoins: result.coins });
        } else {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error updating user coins:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Controller for spinning the wheel
exports.spinWheel = async (req, res) => {
    try {
        const { userId, spinResult } = req.body;

        // Validate spinResult
        if (typeof spinResult !== 'number') {
            return res.status(400).json({ message: 'Invalid spin result provided' });
        }

        // Find the user by ID
        const user = await UserBalance.findOne({ user_id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has enough coins to spin
        if (user.coins < 100) {
            return res.status(400).json({ message: 'Not enough coins to spin the wheel' });
        }

        // Deduct 100 coins for spinning
        user.coins -= 100;

        // Update the coins based on the provided spin result
        if (spinResult > 0) {
            user.coins += spinResult; // Add coins
        } else {
            user.coins += spinResult; // Subtract coins (spinResult is negative)
        }

        // Add transaction to balance history
        user.balance_history.push({
            transactionType: spinResult >= 0 ? 'Credited' : 'Debited',
            amount: Math.abs(spinResult),
            date: new Date()
        });

        // Update last updated timestamp
        user.last_updated = new Date();

        // Save the updated user document
        await user.save();

        return res.status(200).json({
            message: 'Spin completed successfully',
            spinResult,
            coins: user.coins
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error });
    }
};

exports.getUnifiedEarningHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure userId is a valid ObjectId string before converting
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        // Convert userId to ObjectId (using mongoose.Types.ObjectId directly)
        const userObjectId = new mongoose.Types.ObjectId(userId);  // Using 'new' for ObjectId conversion

        // Fetch user wallet history
        const user = await UserBalance.findOne({ user_id: userObjectId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("user",user);

        // Get balance history
        const spinHistory = user.balance_history
            .map(entry => ({
                amount: entry.amount,
                date: entry.date,
                source: 'Spin Wheel',
                transactionType: entry.transactionType  // Adding transaction type
            }));

        // Fetch offer-related earnings
        const offerEarnings = await Offer.find({ 'multiple_rewards.goal_status': 2 });
        console.log("offer-earnings",offerEarnings);

        const formattedOfferEarnings = offerEarnings.map(offer => ({
            title: offer.title,
            brand: offer.brand ? offer.brand.brand_name : 'Unknown Brand',
            category: offer.category ? offer.category.cat_name : 'Unknown Category',
            subcategory: offer.subcategory ? offer.subcategory.sub_cat_name : 'Unknown Subcategory',
            amount: offer.total_user_payout,
            date: offer.added_on,
            source: 'Offer',
            transactionType: offer.total_user_payout >= 0 ? 'Credited' : 'Debited'  // Adding transaction type
        }));

        // Combine all earnings
        const unifiedEarnings = [
            ...spinHistory,
            ...formattedOfferEarnings
        ];

        // Sort earnings by date (descending)
        unifiedEarnings.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            message: 'Unified earning history fetched successfully',
            totalEarnings: user.total_earnings,
            history: unifiedEarnings
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching earning history', error });
    }
};







