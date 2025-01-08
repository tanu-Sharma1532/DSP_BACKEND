const mongoose = require('mongoose');

// Define the schema for the Brand model
const brandSchema = new mongoose.Schema({
    brand_name: {
        type: String,
        required: true, // Brand name is required
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category model
        required: true, // Category is required
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory', // Reference to the SubCategory model
        required: true, // Subcategory is required
    },
    brand_image: {
        type: String, // Path or URL of the brand image
    },
    brand_status: {
        type: String,
        enum: ['live', 'pause'], // Allowed values: "live" or "pause"
        default: 'live', // Default status of the brand is "live"
        required: true, // Making brand_status a required field
    },
});

// Create and export the Brand model
const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
