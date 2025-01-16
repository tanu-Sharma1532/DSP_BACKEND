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

        const userBalance = await UserBalanceWithHistory.findOne({ user_id: userId });
        if (!userBalance) {
            console.error(`User balance not found for user ID: ${userId}`);
            return res.status(404).json({ success: false, message: "User balance not found." });
        }

        console.log('Fetched user, lead, offer, and user balance successfully.');

        let goalPayout = 0;

        if (offer.goals_type === 'single') {
            // Update offer goal status and lead details
            lead.goal_status = goalStatus;
            lead.lead_status = goalStatus === "2" ? "2" : goalStatus === "0" ? "0" : "1";
            lead.remarks = remarks;

            if (goalStatus === "2") {
                const amount = offer.goal_amount || 0;
                goalPayout = amount;

                // Update user balance
                userBalance.total_earnings += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount,
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
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
                },
            });
        }

        if (offer.goals_type === 'multiple') {
            const goal = offer.multiple_rewards.id(goalId);
            if (!goal) {
                return res.status(404).json({ success: false, message: "Goal not found." });
            }

            // Update goal status
            goal.goal_status = goalStatus;

            if (goalStatus === "2") {
                const amount = goal.goal_amount || 0;
                goalPayout = amount;

                // Update user balance
                userBalance.total_earnings += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount,
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
                await userBalance.save();
            }

            // Update lead status
            const allComplete = offer.multiple_rewards.every((g) => String(g.goal_status) === "2");
            lead.lead_status = allComplete ? "2" : "1";
            lead.remarks = remarks;

            await lead.save();

            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for multiple goals.",
                data: {
                    offer: {
                        offerId: offer._id,
                        title: offer.title,
                        goal_status: allComplete ? "2" : "1",
                        goals_type: offer.goals_type,
                        multiple_rewards: offer.multiple_rewards.map((g) => ({
                            goal_id: g._id,
                            goal_name: g.goal_name,
                            goal_status: g.goal_status,
                        })),
                    },
                    lead: {
                        leadId: lead._id,
                        lead_status: lead.lead_status,
                        remarks: lead.remarks,
                    },
                    total_earnings: userBalance.total_earnings,
                    goal_payout: goalPayout,
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
