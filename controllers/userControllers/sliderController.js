const Slider = require('../../models/adminModel/sliderModel');

exports.getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.find()
            .populate('offer_id', 'title');
        const formattedSliders = sliders.map(slider => ({
            _id: slider._id,
            banner_image: slider.banner_image,
            offer_id: slider.offer_id._id,  
            title: slider.offer_id.title,  
        }));

        res.status(200).json({ sliders: formattedSliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sliders.', error: error.message });
    }
};
