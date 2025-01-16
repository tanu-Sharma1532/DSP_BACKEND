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
            console.log('Invalid userId format');
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('Converted userId to ObjectId:', userObjectId);

        // Fetch user wallet history
        const user = await UserBalance.findOne({ user_id: userObjectId });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User balance data:', user);

        // Get balance history
        const spinHistory = user.balance_history.map(entry => ({
            amount: entry.amount,
            date: entry.date,
            source: 'Spin Wheel',
            transactionType: entry.transactionType
        }));
        console.log('Spin wheel history:', spinHistory);

        // Fetch offer-related earnings
        const offerEarnings = await Offer.find();
        console.log('Offer earnings fetched:', offerEarnings);

        // Format offer earnings and calculate goal earnings
        let goalEarnings = 0;
        const formattedOfferEarnings = offerEarnings.map(offer => {
            const completedGoals = offer.multiple_rewards.filter(goal => goal.goal_status === 2);
            console.log('Completed goals for offer:', offer.title, completedGoals);

            if (completedGoals.length === 0) {
                return null;
            }

            completedGoals.forEach(goal => {
                goalEarnings += goal.goal_amount; // Accumulate goal earnings
                console.log('Accumulated goal earnings:', goalEarnings);
            });

            const goals = completedGoals.map(goal => ({
                goalName: goal.goal_name,
                goalStatus: goal.goal_status,
                goalAmount: goal.goal_amount
            }));

            return {
                title: offer.title,
                amount: offer.total_user_payout,
                date: offer.added_on,
                source: 'Offer',
                transactionType: offer.total_user_payout >= 0 ? 'Credited' : 'Debited',
                goals
            };
        }).filter(offer => offer !== null);

        console.log('Formatted offer earnings:', formattedOfferEarnings);

        // Combine all earnings
        const unifiedEarnings = [
            ...spinHistory,
            ...formattedOfferEarnings
        ];
        console.log('Unified earnings before sorting:', unifiedEarnings);

        // Sort earnings by date (descending)
        unifiedEarnings.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Sorted unified earnings:', unifiedEarnings);

        // Update user balance if there were goal earnings
        if (goalEarnings > 0) {
            user.total_earnings += goalEarnings; // Update total earnings
            user.balance_history.push({
                amount: goalEarnings,
                date: new Date(),
                transactionType: 'Credited' // Assuming goal earnings are credited
            });

            console.log('Updating user balance with goal earnings:', goalEarnings);
            await user.save(); // Save updated user balance
            console.log('User balance after update:', user);
        }

        return res.status(200).json({
            message: 'Unified earning history fetched successfully',
            totalEarnings: user.total_earnings,
            history: unifiedEarnings, // Combined earnings (spin wheel + offer)
            offerEarnings: formattedOfferEarnings // Offer-specific earnings
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'An error occurred while fetching earning history', error });
    }
};