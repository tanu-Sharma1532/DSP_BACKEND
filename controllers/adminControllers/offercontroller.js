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


exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate({
                path: 'brand',
                select: 'brand_name brand_image' // Select only the brand name and image
            })
            .populate({
                path: 'category',
                select: 'cat_name cat_image' // Select only the category name and image
            })
            .select('title offer_status our_payout total_user_payout added_on featured') // Select the required fields for the offer
            .exec();

        // Formatting the response data to match the requested structure
        const formattedOffers = offers.map(offer => ({
            id: offer._id || null,
            title: offer.title || null,
            brand_name: offer.brand?.brand_name || null,
            brand_image: offer.brand?.brand_image || null,
            cat_name: offer.category?.cat_name || null,
            cat_image: offer.category?.cat_image || null,
            subcategory: offer.subcategory || null, // Assuming subcategory is directly stored in the offer
            our_payout: offer.our_payout || null,
            user_payout: offer.total_user_payout || null,
            added_on: offer.added_on || null,
            featured: offer.featured || null,
            offer_status: offer.offer_status || null
        }));

        res.status(200).json({ success: true, data: formattedOffers });
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
