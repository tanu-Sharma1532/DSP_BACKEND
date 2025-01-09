const mongoose = require('mongoose');

const TextSliderSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    offer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        default: null,
    },
});

module.exports = mongoose.model('TextSlider', TextSliderSchema);
