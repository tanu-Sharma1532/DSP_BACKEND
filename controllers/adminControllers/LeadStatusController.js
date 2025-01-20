const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Offer = require('../../models/adminModel/offerModel');
const UserLead = require('../../models/adminModel/userLeadsModel');
const UserBalanceWithHistory = require('../../models/userModel/userBalanceModel');
const User = require('../../models/userModel/userModel');

exports.updateGoalAndLeadStatusForUser = async (req, res) => {
    try {
        const { userId, offerId, goalId, goalStatus, remarks, leadId } = req.body;

        console.log('Request body:', req.body);

        // Validate ObjectId
        const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
        if (!isValidId(userId) || !isValidId(offerId) || !isValidId(leadId)) {
            console.error('Invalid Object ID(s) provided.');
            return res.status(400).json({ success: false, message: "Invalid User ID, Offer ID, or Lead ID." });
        }

        // Fetch the required documents
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const lead = await UserLead.findById(leadId);
        if (!lead || String(lead.user_id) !== String(userId)) {
            console.error(`Lead not found or does not belong to the user: ${leadId}`);
            return res.status(404).json({ success: false, message: "Lead not found or does not belong to the user." });
        }

        const offer = await Offer.findById(offerId);
        if (!offer) {
            console.error(`Offer not found for ID: ${offerId}`);
            return res.status(404).json({ success: false, message: "Offer not found." });
        }

        // Fetch or create user balance
        let userBalance = await UserBalanceWithHistory.findOne({ user_id: userId });
        if (!userBalance) {
            userBalance = new UserBalanceWithHistory({
                user_id: userId,
                wallet_balance: 0,
                total_earnings: 0,
                wheel_earnings: 0,
                last_updated: moment().tz('Asia/Kolkata').toDate(),
                coins: 0,
                balance_history: [],
                goals: []
            });
            await userBalance.save();
            console.log(`Created new balance record for user ID: ${userId}`);
        }

        console.log('Fetched user, lead, offer, and user balance successfully.');

        let goalPayout = 0;

        if (offer.goals_type === 'single') {
            lead.goal_status = goalStatus;
            lead.lead_status = goalStatus === "2" ? "2" : goalStatus === "0" ? "0" : "1";
            lead.remarks = remarks;

            if (goalStatus === "2") {
                const amount = offer.our_payout || 0;
                goalPayout = amount;

                userBalance.total_earnings += amount;
                userBalance.coins += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount: amount,
                    date: moment().tz('Asia/Kolkata').toDate(),
                    source: {
                        offer_id: offerId,
                        goal_name: goalId,
                        goal_payout: amount,
                        completed_on: moment().tz('Asia/Kolkata').toDate()
                    }
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();

                if (!userBalance.goals) userBalance.goals = [];

                const goalExists = userBalance.goals.some(g => String(g.offer_id) === String(offerId) && String(g.goal_name) === goalId);
                if (!goalExists) {
                    userBalance.goals.push({
                        offer_id: offerId,
                        goal_name: goalId,
                        goal_payout: amount,
                        completed_on: moment().tz('Asia/Kolkata').toDate(),
                    });
                }

                // Add total_coins and total_user_payout if lead_status is 2
                if (lead.lead_status === '2') {
                    const totalCoins = offer.total_coins || 0;
                    const totalUserPayout = offer.total_user_payout || 0;

                    userBalance.coins += totalCoins;
                    userBalance.total_earnings += totalUserPayout;

                    userBalance.balance_history.push({
                        transactionType: 'Credited',
                        amount: totalUserPayout,
                        date: moment().tz('Asia/Kolkata').toDate(),
                        source: {
                            offer_id: offerId,
                            goal_name: 'Total Payout',
                            goal_payout: totalUserPayout,
                            completed_on: moment().tz('Asia/Kolkata').toDate()
                        }
                    });
                    userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
                }

                await userBalance.save();
            }

            await lead.save();

            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for single goal.",
                data: {
                    offer: {
                        offerId: offer._id,
                        title: offer.title,
                        goal_status: lead.goal_status,
                        goals_type: offer.goals_type,
                    },
                    lead: {
                        leadId: lead._id,
                        lead_status: lead.lead_status,
                        remarks: lead.remarks,
                    },
                    total_earnings: userBalance.total_earnings,
                    goal_payout: goalPayout,
                    user_id: userId,
                    offer_id: offerId,
                    goal_id: goalId,
                    goal_status: goalStatus,
                },
            });
        }

        if (offer.goals_type === 'multiple') {
            const goalIndex = lead.goals.findIndex(g => String(g.goal_id) === String(goalId));
            if (goalIndex !== -1) {
                lead.goals[goalIndex].goal_status = goalStatus;
            } else {
                lead.goals.push({ goal_id: goalId, goal_status: goalStatus });
            }

            const allGoalsCompleted = lead.goals.every(g => g.goal_status === 2);
            lead.lead_status = allGoalsCompleted ? "2" : "1";
            lead.remarks = remarks;

            if (allGoalsCompleted) {
                const amount = offer.our_payout || 0;
                goalPayout = amount;

                userBalance.total_earnings += amount;
                userBalance.coins += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount: amount,
                    date: moment().tz('Asia/Kolkata').toDate(),
                    source: {
                        offer_id: offerId,
                        goal_name: 'All Goals',
                        goal_payout: amount,
                        completed_on: moment().tz('Asia/Kolkata').toDate()
                    }
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();

                // Add total_coins and total_user_payout if all goals are completed
                const totalCoins = offer.total_coins || 0;
                const totalUserPayout = offer.total_user_payout || 0;

                userBalance.coins += totalCoins;
                userBalance.total_earnings += totalUserPayout;

                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount: totalUserPayout,
                    date: moment().tz('Asia/Kolkata').toDate(),
                    source: {
                        offer_id: offerId,
                        goal_name: 'Total Payout',
                        goal_payout: totalUserPayout,
                        completed_on: moment().tz('Asia/Kolkata').toDate()
                    }
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();

                await userBalance.save();
            }

            await lead.save();

            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for multiple goals.",
                data: {
                    lead: {
                        leadId: lead._id,
                        lead_status: lead.lead_status,
                        remarks: lead.remarks,
                        goals: lead.goals.map((g) => ({
                            goal_id: g.goal_id,
                            goal_status: g.goal_status,
                        })),
                    },
                    total_earnings: userBalance.total_earnings,
                    goal_payout: goalPayout,
                    user_id: userId,
                    offer_id: offerId,
                    goal_id: goalId,
                    goal_status: goalStatus,
                },
            });
        }

        return res.status(400).json({ success: false, message: "Invalid goal type." });
    } catch (error) {
        console.error('Error in updating goal and lead status for user:', error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};
