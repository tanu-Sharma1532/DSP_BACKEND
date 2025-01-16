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
            // If user balance does not exist, create a new balance record
            userBalance = new UserBalanceWithHistory({
                user_id: userId,
                wallet_balance: 0,
                total_earnings: 0,
                wheel_earnings: 0,
                last_updated: moment().tz('Asia/Kolkata').toDate(),
                coins: 0,
                balance_history: [],
                goals: [] // initialize the goals array as empty
            });
            await userBalance.save();
            console.log(`Created new balance record for user ID: ${userId}`);
        }

        console.log('Fetched user, lead, offer, and user balance successfully.');

        let goalPayout = 0;

        if (offer.goals_type === 'single') {
            // Handle single goal type
            lead.goal_status = goalStatus; // Update the goal_status directly for single goal

            lead.lead_status = goalStatus === "2" ? "2" : goalStatus === "0" ? "0" : "1";
            lead.remarks = remarks;

            if (goalStatus === "2") {
                const amount = offer.our_payout || 0;
                goalPayout = amount;

                // Update user balance
                userBalance.total_earnings += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount,
                    date: moment().tz('Asia/Kolkata').toDate(),
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();

                // Add the goal to the goals array if not already added
                const goalExists = userBalance.goals.some(g => String(g.offer_id) === String(offerId) && String(g.goal_name) === goalId);
                if (!goalExists) {
                    userBalance.goals.push({
                        offer_id: offerId,
                        goal_name: goalId,
                        goal_payout: amount,
                        completed_on: moment().tz('Asia/Kolkata').toDate(),
                    });
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
            // Find the goal in the multiple_rewards array by goalId
            const goal = offer.multiple_rewards.find((g) => String(g._id) === String(goalId));
            if (!goal) {
                return res.status(404).json({ success: false, message: "Goal not found in offer's multiple_rewards." });
            }

            // Update the goal's status
            goal.goal_status = goalStatus;
            goalPayout = goal.goal_amount || 0;

            // Update user balance
            if (goalStatus === "2") {
                userBalance.total_earnings += goalPayout;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount: goalPayout,
                    date: moment().tz('Asia/Kolkata').toDate(),
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();

                // Add the goal to the goals array if not already added
                const goalExists = userBalance.goals.some(g => String(g.offer_id) === String(offerId) && String(g.goal_name) === goalId);
                if (!goalExists) {
                    userBalance.goals.push({
                        offer_id: offerId,
                        goal_name: goalId,
                        goal_payout: goalPayout,
                        completed_on: moment().tz('Asia/Kolkata').toDate(),
                    });
                }

                await userBalance.save();
            }

            // Update the lead's goals array
            const goalInLead = lead.goals.find((g) => String(g.goal_id) === String(goalId));
            if (goalInLead) {
                goalInLead.goal_status = goalStatus;
            } else {
                lead.goals.push({
                    goal_id: goalId,
                    goal_status: goalStatus,
                });
            }

            lead.remarks = remarks;

            // Check if all goals in the offer are completed
            const allGoalsCompleted = offer.multiple_rewards.every((g) => g.goal_status === "2");

            // Update lead_status
            lead.lead_status = allGoalsCompleted ? "2" : "1";

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
