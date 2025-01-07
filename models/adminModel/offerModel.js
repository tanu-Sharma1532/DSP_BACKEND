const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    banner_image: {
        type: String,  // Path to the uploaded banner image
        required: true
    },
    brand: {
        type: String,  // Brand name
        required: true
    },
    category: {
        type: String,  // Category name
        required: true
    },
    subcategory: {
        type: String,  // Subcategory name
        required: true
    },
    our_payout: {
        type: Number,
        required: true
    },
    total_user_payout: {
        type: Number,
        required: true
    },
    goals_type: {
        type: String,
        enum: ['single', 'multiple'],
        required: true
    },
    multiple_rewards: [
        {
            goal_name: {
                type: String,
                required: true
            },
            goal_amount: {
                type: Number,
                required: true
            }, 
            goal_description: {
                type: String,
                required: true
            },
            goal_status: {
                type: Number, // 0: Rejected, 1: In Process, 2: Complete
                required: true,
                default: 1
            }
        }
    ],
    offer_url: {
        type: String,
        required: true
    },
    offer_id: {
        type: String,
        required: true,
        unique: true
    },
    offer_type: {
        type: String,
        enum: ['web', 'app'],
        required: true
    },
    total_coins: {
        type: Number,
        required: true
    },
    time_to_complete: {
        type: String,  // Time to complete, can be in any format like days or hours
        required: true
    },
    apk_link: {
        type: String,
        required: false
    },
    added_on: {
        type: Date,
        default: Date.now
    },
    targeted_city: {
        type: String,
        enum: ['all', 'selected'],
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    offer_status: {
        type: String,
        enum: ['live', 'pause'],
        required: true
    }
});

module.exports = mongoose.model('Offer', offerSchema);
