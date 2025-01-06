const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brand_name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Assuming you have a Category model
        required: true,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory', // Assuming you have a SubCategory model
        required: true,
    },
    brand_image: {
        type: String, // Path to the image
    },
});

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
