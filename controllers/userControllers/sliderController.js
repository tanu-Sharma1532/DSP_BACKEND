const Slider = require('../../models/adminModel/sliderModel');

exports.getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.find()
            .populate('offer_id', 'title'); // Populate offer_id with 'title'

        // Format the response to include offer_id as a string and add title directly
        const formattedSliders = sliders.map(slider => ({
            _id: slider._id,
            banner_image: slider.banner_image,
            offer_id: slider.offer_id._id,  // Extract offer_id as string
            title: slider.offer_id.title,   // Add the title directly
            __v: slider.__v,
        }));

        res.status(200).json({ sliders: formattedSliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sliders.', error: error.message });
    }
};
