const mongoose = require('mongoose');
const Offer = require('../../models/adminModel/offerModel');
const UserLead = require('../../models/adminModel/userLeadsModel');

exports.updateGoalAndLeadStatus = async (req, res) => {
    try {
        const { offerId, goalId, goalStatus, remarks, leadId } = req.body; // Take leadId from the request body

        // Log the offerId and leadId to verify they're being passed correctly
        console.log("Offer ID from request body:", offerId);
        console.log("Lead ID from request body:", leadId);

        // Check if the offerId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(offerId)) {
            return res.status(400).json({ success: false, message: "Invalid Offer ID." });
        }

        // Check if the leadId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({ success: false, message: "Invalid Lead ID." });
        }

        // Fetch the offer
        const offer = await Offer.findById(offerId);
        if (!offer) {
            console.log('Offer not found with ID:', offerId);
            return res.status(404).json({ success: false, message: "Offer not found." });
        }

        // Log the fetched offer to verify it's correct
        console.log("Fetched Offer:", offer);

        // Handle single goal type
        if (offer.goals_type === 'single') {
            offer.goal_status = goalStatus; // Update the goal status directly
            await offer.save();

            // Update lead status based on the single goal status
            const leadStatus = goalStatus === 2 ? 2 : goalStatus === 0 ? 0 : 1;
            const updatedLead = await UserLead.findByIdAndUpdate(
                leadId,
                { lead_status: leadStatus, remarks },
                { new: true } // Return the updated lead
            );

            if (!updatedLead) {
                return res.status(404).json({ success: false, message: "Lead not found." });
            }

            // Log for debugging
            console.log('Single Goal Status Updated:', goalStatus);
            console.log('Lead Status Updated for Single Goal:', leadStatus);

            // Send response with lead details
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
                    remarks,
                    lead: {
                        leadId: updatedLead._id,
                        lead_status: updatedLead.lead_status,
                        remarks: updatedLead.remarks,
                    },
                },
            });
        }

        // Handle multiple goal type
        if (offer.goals_type === 'multiple') {
            const goal = offer.multiple_rewards.id(goalId);
            if (!goal) {
                return res.status(404).json({ success: false, message: "Goal not found." });
            }

            // Update the specific goal status
            goal.goal_status = goalStatus;

            // Save the updated offer
            await offer.save();

            // Log goal statuses
            console.log('Updated Goal Status:', goalStatus);
            console.log('All Goal Statuses:', offer.multiple_rewards.map(g => g.goal_status));

            // Determine the lead status based on all goal statuses
            const allGoals = offer.multiple_rewards;
            const allComplete = allGoals.every(g => g.goal_status === 2);
            const anyRejected = allGoals.some(g => g.goal_status === 0);

            let leadStatus;
            if (anyRejected) {
                leadStatus = 0; // Rejected
            } else if (allComplete) {
                leadStatus = 2; // Completed
            } else {
                leadStatus = 1; // In Process
            }

            // Log the computed lead status
            console.log('Computed Lead Status:', leadStatus);

            // Update the specific lead
            const updatedLead = await UserLead.findByIdAndUpdate(
                leadId,
                { lead_status: leadStatus, remarks },
                { new: true } // Return the updated lead
            );

            if (!updatedLead) {
                return res.status(404).json({ success: false, message: "Lead not found." });
            }

            // Send the response with lead details
            return res.status(200).json({
                success: true,
                message: "Goal and lead statuses updated successfully for multiple goals.",
                data: {
                    offer: {
                        offerId: offer._id,
                        title: offer.title,
                        goal_status: allComplete ? 2 : 1, // Overall goal status
                        goals_type: offer.goals_type,
                        multiple_rewards: allGoals.map(g => ({
                            goal_id: g._id,
                            goal_name: g.goal_name,
                            goal_status: g.goal_status,
                        })),
                    },
                    remarks,
                    lead: {
                        leadId: updatedLead._id,
                        lead_status: updatedLead.lead_status,
                        remarks: updatedLead.remarks,
                    },
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
