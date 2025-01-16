const mongoose = require('mongoose');
const User = require('../../models/userModel/userModel');
const UserLead = require('../../models/adminModel/userLeadsModel');

exports.getUserRankingsByEarnings = async (req, res) => {
    try {
        // Aggregation pipeline for users with lead_status = '2'
        const rankings = await UserLead.aggregate([
            {
                // Lookup to join User collection
                $lookup: {
                    from: 'users',
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

        // Aggregation pipeline for users whose goal_status = '2'
        const goalUsers = await UserLead.aggregate([
            {
                // Lookup to join User collection
                $lookup: {
                    from: 'users',
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
                // Filter for leads with goal_status "2"
                $match: {
                    'multiple_rewards.goal_status': 2, // Ensure goal_status is treated as a number
                },
            },
            {
                // Group by user_id and collect goal details
                $group: {
                    _id: '$user_id',
                    name: { $first: '$userDetails.name' },
                    email: { $first: '$userDetails.email' },
                    totalGoals: { $sum: 1 },
                    goalNames: { $addToSet: '$multiple_rewards.goal_name' }, // Collect unique goal names
                },
            },
        ]);
        
        console.log("goalUsers",goalUsers);
        // Combine rankings and goalUsers data
        const combinedData = rankings.map(user => ({
            rank: rankings.indexOf(user) + 1,
            user_id: user._id,
            name: user.name,
            email: user.email,
            total_valid_leads: user.totalValidLeads,
            total_earnings: user.total_earnings,
        }));

        goalUsers.forEach(goalUser => {
            // Check if the user is already in rankings
            const existingUser = combinedData.find(user => user.user_id.equals(goalUser._id));
            if (!existingUser) {
                combinedData.push({
                    rank: null, // Rank not applicable for goal users without earnings
                    user_id: goalUser._id,
                    name: goalUser.name,
                    email: goalUser.email,
                    total_valid_leads: 0, // No valid leads
                    total_earnings: 0, // No earnings
                    total_goals: goalUser.totalGoals,
                    goal_names: goalUser.goalNames, // Include goal names
                });
            } else {
                existingUser.total_goals = goalUser.totalGoals;
                existingUser.goal_names = goalUser.goalNames; // Merge goal names for ranked users
            }
        });

        // Sort combined data by rank, ensuring users without rank are at the end
        combinedData.sort((a, b) => {
            if (a.rank && b.rank) return a.rank - b.rank;
            if (a.rank) return -1;
            if (b.rank) return 1;
            return 0;
        });

        return res.status(200).json({
            success: true,
            message: 'User rankings and goals retrieved successfully.',
            rankings: combinedData,
        });
    } catch (error) {
        console.error('Error retrieving user rankings:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
