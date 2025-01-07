const mongoose = require('mongoose');
const User = require('../../models/userModel/userModel'); 
const Offer = require('../../models/adminModel/offerModel'); 
const Lead = require('../../models/adminModel/userLeadsModel'); 
const moment = require('moment-timezone');

exports.getDashboardData = async (req, res) => {
    try {
        const today = moment().tz('Asia/Kolkata').startOf('day').toDate();
        const tomorrow = moment(today).add(1, 'day').toDate();

        // Total Users
        const totalUsers = await User.countDocuments();

        // Today's Registered Users
        const todaysRegisteredUsers = await User.countDocuments({
            createdOn: { $gte: today, $lt: tomorrow },
        });

        // Users by State
        const usersByState = await User.aggregate([
            { $group: { _id: '$state', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Total Offers
        const totalOffers = await Offer.countDocuments();

        // Expired Offers
        const expiredOffers = await Offer.countDocuments({ offer_status: 'pause' });

        // Completed Offers
        const completedOffers = await Lead.countDocuments({
            lead_status: 2,  // Assuming 2 represents completed status in the lead_status field
        });
        console.log(completedOffers);
        // Today's Completed Offers (Leads)
        const todaysCompletedOffers = await Lead.countDocuments({
            added_on: { $gte: today, $lt: tomorrow },
            lead_status: 2, // Completed leads
        });

        // Top 5 Performing Offers by Leads
        const topOffers = await Lead.aggregate([
            {
                $group: {
                    _id: '$offer_id',
                    leadCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'offers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'offerDetails',
                },
            },
            { $unwind: '$offerDetails' },
            { $sort: { leadCount: -1 } },
            { $limit: 5 },
            {
                $project: {
                    offer_id: '$_id',
                    title: '$offerDetails.title',
                    leadCount: 1,
                },
            },
        ]);

        // Top 5 Performing Users by Leads
        const topUsers = await Lead.aggregate([
            {
                $group: {
                    _id: '$user_id',
                    leadCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            { $unwind: '$userDetails' },
            { $sort: { leadCount: -1 } },
            { $limit: 5 },
            {
                $project: {
                    user_id: '$_id',
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    leadCount: 1,
                },
            },
        ]);

        // Response
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                todaysRegisteredUsers,
                usersByState,
                totalOffers,
                expiredOffers,
                completedOffers,
                todaysCompletedOffers,
                topOffers,
                topUsers,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message,
        });
    }
};

