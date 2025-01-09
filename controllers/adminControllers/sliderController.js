const Slider = require('../../models/adminModel/sliderModel'); 

const path = require('path');

exports.createSlider = async (req, res) => {
    try {
        const { offer_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Banner image is required.' });
        }

        // Normalize the file path to use forward slashes
        const normalizedPath = req.file.path.replace(/\\/g, '/');

        const slider = new Slider({
            banner_image: normalizedPath,
            offer_id: offer_id || null,
        });

        const savedSlider = await slider.save();
        res.status(201).json({ message: 'Slider created successfully.', slider: savedSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error creating slider.', error: error.message });
    }
};


// Get all sliders
exports.getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.find().populate('offer_id', 'title'); // Adjust the fields in `offer_id` as needed
        res.status(200).json({ sliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sliders.', error: error.message });
    }
};

// Get a single slider by ID
exports.getSliderById = async (req, res) => {
    try {
        const { id } = req.params;
        const slider = await Slider.findById(id).populate('offer_id', 'title'); // Adjust the fields in `offer_id` as needed

        if (!slider) {
            return res.status(404).json({ message: 'Slider not found.' });
        }

        res.status(200).json({ slider });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching slider.', error: error.message });
    }
};

// Update a slider
exports.updateSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const { offer_id } = req.body;

        const updateData = { offer_id: offer_id || null };

        if (req.file) {
            updateData.banner_image = req.file.path;
        }

        const updatedSlider = await Slider.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedSlider) {
            return res.status(404).json({ message: 'Slider not found.' });
        }

        res.status(200).json({ message: 'Slider updated successfully.', slider: updatedSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error updating slider.', error: error.message });
    }
};

// Delete a slider
exports.deleteSlider = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSlider = await Slider.findByIdAndDelete(id);

        if (!deletedSlider) {
            return res.status(404).json({ message: 'Slider not found.' });
        }

        res.status(200).json({ message: 'Slider deleted successfully.', slider: deletedSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting slider.', error: error.message });
    }
};
