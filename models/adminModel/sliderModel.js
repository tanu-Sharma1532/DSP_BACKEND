const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  banner_image: {
    type: String,
    required: true, 
  },
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer', 
    required: false, 
  }
});

module.exports = mongoose.model('Slider', sliderSchema);
