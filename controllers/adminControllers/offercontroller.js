const Offer = require('../../models/adminModel/offerModel');

// Create Offer
exports.createOffer = async (req, res) => {
    try {
        const offerData = req.body;

        // Handle banner_image upload
        if (req.file) { // Use req.file for single file uploads
            offerData.banner_image = `/uploads/banner_images/${req.file.filename}`;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Banner image is required.' 
            });
        }

        // Create and save the offer
        const newOffer = new Offer(offerData);
        const savedOffer = await newOffer.save();

        res.status(201).json({ success: true, message: 'Offer created successfully.', data: savedOffer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ success: false, message: 'Error creating offer.', error: error.message });
    }
};


// Get all offers
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find();
        res.status(200).json({ success: true, data: offers });
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ success: false, message: 'Error fetching offers.', error: error.message });
    }
};

// Get offer by ID
exports.getOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found.' });
        }

        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        console.error('Error fetching offer:', error);
        res.status(500).json({ success: false, message: 'Error fetching offer.', error: error.message });
    }
};

// Update offer by ID
exports.updateOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Handle banner_image upload
        if (req.files && req.files.banner_image) {
            updatedData.banner_image = `/uploads/banner_images/${req.files.banner_image[0].filename}`;
        }

        const updatedOffer = await Offer.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedOffer) {
            return res.status(404).json({ success: false, message: 'Offer not found.' });
        }

        res.status(200).json({ success: true, message: 'Offer updated successfully.', data: updatedOffer });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ success: false, message: 'Error updating offer.', error: error.message });
    }
};

// Delete offer by ID
exports.deleteOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOffer = await Offer.findByIdAndDelete(id);

        if (!deletedOffer) {
            return res.status(404).json({ success: false, message: 'Offer not found.' });
        }

        res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ success: false, message: 'Error deleting offer.', error: error.message });
    }
};
