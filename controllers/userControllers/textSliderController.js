const TextSlider = require('../../models/adminModel/textslider');

exports.getAllTextSliders = async (req, res) => {
    try {
        const textSliders = await TextSlider.find().populate('offer_id', 'title'); // Adjust the fields in `offer_id` as needed
        res.status(200).json({ textSliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching text sliders.', error: error.message });
    }
};