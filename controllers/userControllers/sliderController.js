const Slider = require('../../models/adminModel/sliderModel');

exports.getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.find().populate('offer_id', 'title'); // Adjust the fields in `offer_id` as needed
        res.status(200).json({ sliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sliders.', error: error.message });
    }
};