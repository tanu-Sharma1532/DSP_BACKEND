const Offer = require('../../models/adminModel/offerModel');

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