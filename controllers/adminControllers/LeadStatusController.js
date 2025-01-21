const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Offer = require('../../models/adminModel/offerModel');
const UserLead = require('../../models/adminModel/userLeadsModel');
const UserBalanceWithHistory = require('../../models/userModel/userBalanceModel');
const User = require('../../models/userModel/userModel');

exports.getAllLeads = async (req, res) => {
    try {
        // Fetch all leads with populated user and offer details
        const leads = await UserLead.find()
            .populate('user_id', 'name email') // Replace 'name email' with the desired fields from the User model
            .populate('offer_id', 'title description'); // Replace 'title description' with the desired fields from the Offer model

        if (!leads.length) {
            return res.status(404).json({ message: 'No leads found' });
        }

        res.status(200).json({
            success: true,
            data: leads,
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.getLeadById = async (req, res) => {
    const { id } = req.params;

    try {
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lead ID format',
            });
        }

        // Fetch the lead by ID with populated user and offer details
        const lead = await UserLead.findById(id)
            .populate('user_id', 'name email') // Replace 'name email' with the desired fields from the User model
            .populate('offer_id', 'title description'); // Replace 'title description' with the desired fields from the Offer model

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        res.status(200).json({
            success: true,
            data: lead,
        });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

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

            // Save the exact goal name in the lead document
            lead.goal_name = offer.goal_name;  // Directly use the goal_name from the offer model

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
                        goal_name: offer.goal_name, // Use the exact goal name from the offer model
                        goal_payout: amount,
                        completed_on: moment().tz('Asia/Kolkata').toDate()
                    }
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();

                if (!userBalance.goals) userBalance.goals = [];

                const goalExists = userBalance.goals.some(g => String(g.offer_id) === String(offerId) && String(g.goal_name) === offer.goal_name);
                if (!goalExists) {
                    userBalance.goals.push({
                        offer_id: offerId,
                        goal_name: offer.goal_name, // Use the exact goal name from the offer model
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

                    // Use the goal_name from offer model
                    userBalance.balance_history.push({
                        transactionType: 'Credited',
                        amount: totalUserPayout,
                        date: moment().tz('Asia/Kolkata').toDate(),
                        source: {
                            offer_id: offerId,
                            goal_name: offer.goal_name,  // Use the exact goal name from the offer model
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
                        goal_name: lead.goal_name, // Returning the exact goal name saved
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

        // For multiple goals type
        if (offer.goals_type === 'multiple') {
            const goalIndex = lead.goals.findIndex(g => String(g.goal_id) === String(goalId));
            let goalName = null;

            // Find the goal name from the multiple_rewards array
            if (goalIndex !== -1) {
                lead.goals[goalIndex].goal_status = goalStatus;
            } else {
                lead.goals.push({ goal_id: goalId, goal_status: goalStatus });
            }

            // Find the goal name from the multiple_rewards
            const reward = offer.multiple_rewards.find(reward => String(reward._id) === String(goalId));
            if (reward) {
                goalName = reward.goal_name;
            }

            if (!goalName) {
                goalName = offer.goal_name;  // Fallback to the goal_name from the offer model
            }

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
                        goal_name: goalName, // Use the exact goal name from multiple_rewards or fallback
                        goal_payout: amount,
                        completed_on: moment().tz('Asia/Kolkata').toDate()
                    }
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
            }

            // Check if all goals are completed (status = '2') to mark lead as completed
            const allGoalsCompleted = lead.goals.every(g => g.goal_status === '2');

            // Only set lead_status to '2' if all goals are completed
            if (allGoalsCompleted) {
                lead.lead_status = "2";  // Update lead status to '2' only if all goals are completed
            } else {
                lead.lead_status = "1";  // Update lead status to '1' if not all goals are completed
            }

            lead.remarks = remarks;

            // Now check if the lead status has been updated to '2' and add total payout and coins
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
                        goal_name: goalName,  // Use the goal_name from the corresponding reward or fallback
                        goal_payout: totalUserPayout,
                        completed_on: moment().tz('Asia/Kolkata').toDate()
                    }
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
            }

            await userBalance.save();
            await lead.save();

            // Map the lead goals to include the goal_name from the offer's multiple_rewards
            const updatedGoals = lead.goals.map(g => {
                const reward = offer.multiple_rewards.find(reward => String(reward._id) === String(g.goal_id));
                return {
                    goal_id: g.goal_id,
                    goal_name: reward ? reward.goal_name : g.goal_id, // Fallback to goal_id if not found
                    goal_status: g.goal_status
                };
            });

            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for multiple goals.",
                data: {
                    lead: {
                        leadId: lead._id,
                        lead_status: lead.lead_status,
                        remarks: lead.remarks,
                        goals: updatedGoals, // Include goal_name along with other details
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
