const mongoose = require('mongoose');
const User = require('../../models/userModel/userModel');
const UserLead = require('../../models/adminModel/userLeadsModel');

exports.getUserRankingsByEarnings = async (req, res) => {
    try {
        // Aggregation pipeline to calculate total earnings and valid leads
        const rankings = await UserLead.aggregate([
            {
                // Lookup to join User collection
                $lookup: {
                    from: 'users', // Name of the User collection
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                // Unwind userDetails to flatten the array
                $unwind: '$userDetails',
            },
            {
                // Filter for leads with lead_status "2"
                $match: {
                    lead_status: '2',
                },
            },
            {
                // Group by user_id and calculate total earnings and valid leads
                $group: {
                    _id: '$user_id',
                    name: { $first: '$userDetails.name' },
                    email: { $first: '$userDetails.email' },
                    totalValidLeads: { $sum: 1 },
                    total_earnings: { $sum: { $multiply: [10, 1] } }, // Replace `10` with your logic for earnings per lead
                },
            },
            {
                // Sort by total earnings first, then by totalValidLeads
                $sort: { total_earnings: -1, totalValidLeads: -1 },
            },
        ]);

        // Add rank to each user
        const rankedUsers = rankings.map((user, index) => ({
            rank: index + 1,
            user_id: user._id,
            name: user.name,
            email: user.email,
            total_valid_leads: user.totalValidLeads,
            total_earnings: user.total_earnings,
        }));

        return res.status(200).json({
            message: 'User rankings retrieved successfully.',
            rankings: rankedUsers,
        });
    } catch (error) {
        console.error('Error retrieving user rankings:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
