const TextSlider = require('../../models/adminModel/textslider');

exports.getAllTextSliders = async (req, res) => {
    try {
        const textSliders = await TextSlider.find()
            .populate('offer_id', 'title'); // Populate offer_id with 'title'

        // Format the response to include offer_id as a string and add title directly
        const formattedSliders = textSliders.map(slider => ({
            _id: slider._id,
            text: slider.text,
            offer_id: slider.offer_id._id,  // Extract offer_id as string
            title: slider.offer_id.title,   // Add the title directly
        }));

        res.status(200).json({ textSliders: formattedSliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching text sliders.', error: error.message });
    }
};
