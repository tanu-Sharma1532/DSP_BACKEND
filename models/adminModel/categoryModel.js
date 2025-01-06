const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    cat_name: {
        type: String,
        required: true
    },
    cat_image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Category', categorySchema);
