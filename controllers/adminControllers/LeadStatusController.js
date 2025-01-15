const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Offer = require('../../models/adminModel/offerModel');
const UserLead = require('../../models/adminModel/userLeadsModel');
const UserBalanceWithHistory = require('../../models/userModel/userBalanceModel');

exports.updateGoalAndLeadStatus = async (req, res) => {
    try {
        const { offerId, goalId, goalStatus, remarks, leadId } = req.body;

        console.log('Request body:', req.body);

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(offerId) || !mongoose.Types.ObjectId.isValid(leadId)) {
            console.log('Invalid Offer ID or Lead ID.');
            return res.status(400).json({ success: false, message: "Invalid Offer ID or Lead ID." });
        }

        // Fetch the offer
        const offer = await Offer.findById(offerId);
        if (!offer) {
            console.log('Offer not found for ID:', offerId);
            return res.status(404).json({ success: false, message: "Offer not found." });
        }

        console.log('Offer fetched:', offer);

        // Fetch the lead
        const lead = await UserLead.findById(leadId);
        if (!lead) {
            console.log('Lead not found for ID:', leadId);
            return res.status(404).json({ success: false, message: "Lead not found." });
        }

        console.log('Lead fetched:', lead);

        const userId = lead.user_id; // Get user ID from lead
        const userBalance = await UserBalanceWithHistory.findOne({ user_id: userId });
        console.log("userBalance", userBalance);
        if (!userBalance) {
            console.log('User balance not found for user ID:', userId);
            return res.status(404).json({ success: false, message: "User balance not found." });
        }

        console.log('User balance fetched:', userBalance);

        let goalPayout = 0;

        if (offer.goals_type === 'single') {
            // Update single goal status
            offer.goal_status = goalStatus;
            await offer.save();
            console.log('Single goal status updated:', offer);

            // Update lead status
            const leadStatus = goalStatus === 2 ? 2 : goalStatus === 0 ? 0 : 1;
            lead.lead_status = leadStatus;
            lead.remarks = remarks;
            await lead.save();
            console.log('Lead status updated:', lead);

            // Check if the goalStatus is 2 (completed)
            if (Number(goalStatus) === 2) {
                console.log('Goal Status is 2');
                console.log('Amount Goal:', offer.goal_amount);

                const amount = offer.goal_amount || 0;
                goalPayout = amount;  // store the goal payout value

                // Update total_earnings and save the balance
                userBalance.total_earnings += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount,
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
                
                // Save the updated user balance
                await userBalance.save();
                console.log('User balance updated after crediting:', userBalance);
            } else {
                console.log('Condition not met. Goal Status:', goalStatus, '| Type:', typeof goalStatus);
            }

            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for single goal.",
                data: {
                    offer: {
                        offerId: offer._id,
                        title: offer.title,
                        goal_status: offer.goal_status,
                        goals_type: offer.goals_type,
                    },
                    lead: {
                        leadId: lead._id,
                        lead_status: lead.lead_status,
                        remarks: lead.remarks,
                    },
                    total_earnings: userBalance.total_earnings,
                    goal_payout: goalPayout
                },
            });
        }

        if (offer.goals_type === 'multiple') {
            const goal = offer.multiple_rewards.id(goalId);
            if (!goal) {
                console.log('Goal not found for ID:', goalId);
                return res.status(404).json({ success: false, message: "Goal not found." });
            }

            console.log('Goal fetched:', goal);

            // Update goal status
            goal.goal_status = goalStatus;
            await offer.save();
            console.log('Multiple goal status updated:', goal);

            // Check if the goalStatus is 2 (completed)
            if (Number(goalStatus) === 2) {
                console.log('Goal Status is 2');
                console.log('Amount Goal:', goal.goal_amount);

                const amount = goal.goal_amount || 0;
                goalPayout = amount;  // store the goal payout value

                // Update total_earnings and save the balance
                userBalance.total_earnings += amount;
                userBalance.balance_history.push({
                    transactionType: 'Credited',
                    amount,
                });
                userBalance.last_updated = moment().tz('Asia/Kolkata').toDate();
                
                // Save the updated user balance
                await userBalance.save();
                console.log('User balance updated after crediting:', userBalance);
            } else {
                console.log('Condition not met. Goal Status:', goalStatus, '| Type:', typeof goalStatus);
            }

            // Determine lead status
            const allGoals = offer.multiple_rewards;
            const allComplete = allGoals.every(g => g.goal_status === 2);

            lead.lead_status = allComplete ? 2 : 1; // Update lead status to 2 only if all goals are complete
            lead.remarks = remarks;
            await lead.save();
            console.log('Lead status updated for multiple goals:', lead);

            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for multiple goals.",
                data: {
                    offer: {
                        offerId: offer._id,
                        title: offer.title,
                        goal_status: allComplete ? 2 : 1,
                        goals_type: offer.goals_type,
                        multiple_rewards: allGoals.map(g => ({
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
                    goal_payout: goalPayout
                },
            });
        }

    } catch (error) {
        console.error('Error in updating goal and lead status:', error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};
