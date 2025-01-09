const TextSlider = require('../../models/adminModel/textslider');

// Create a new text slider
exports.createTextSlider = async (req, res) => {
    try {
        const { text, offer_id } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text is required.' });
        }

        const textSlider = new TextSlider({
            text,
            offer_id: offer_id || null,
        });

        const savedTextSlider = await textSlider.save();
        res.status(201).json({ message: 'Text slider created successfully.', textSlider: savedTextSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error creating text slider.', error: error.message });
    }
};

// Get all text sliders
exports.getAllTextSliders = async (req, res) => {
    try {
        const textSliders = await TextSlider.find().populate('offer_id', 'title'); // Adjust the fields in `offer_id` as needed
        res.status(200).json({ textSliders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching text sliders.', error: error.message });
    }
};

// Get a single text slider by ID
exports.getTextSliderById = async (req, res) => {
    try {
        const { id } = req.params;
        const textSlider = await TextSlider.findById(id).populate('offer_id', 'title'); // Adjust the fields in `offer_id` as needed

        if (!textSlider) {
            return res.status(404).json({ message: 'Text slider not found.' });
        }

        res.status(200).json({ textSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching text slider.', error: error.message });
    }
};

// Update a text slider
exports.updateTextSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, offer_id } = req.body;

        const updateData = { text, offer_id: offer_id || null };

        const updatedTextSlider = await TextSlider.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedTextSlider) {
            return res.status(404).json({ message: 'Text slider not found.' });
        }

        res.status(200).json({ message: 'Text slider updated successfully.', textSlider: updatedTextSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error updating text slider.', error: error.message });
    }
};

// Delete a text slider
exports.deleteTextSlider = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTextSlider = await TextSlider.findByIdAndDelete(id);

        if (!deletedTextSlider) {
            return res.status(404).json({ message: 'Text slider not found.' });
        }

        res.status(200).json({ message: 'Text slider deleted successfully.', textSlider: deletedTextSlider });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting text slider.', error: error.message });
    }
};
