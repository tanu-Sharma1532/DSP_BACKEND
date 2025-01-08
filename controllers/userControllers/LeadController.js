const mongoose = require('mongoose');
const UserLead = require('../../models/adminModel/userLeadsModel');
const Offer = require('../../models/adminModel/offerModel'); 

exports.submitLead = async (req, res) => {
    try {
        const { user_id, offer_id } = req.body;

        // Validate required fields
        if (!user_id || !offer_id) {
            return res.status(400).json({ message: 'User ID and Offer ID are required.' });
        }

        // Check if the offer exists
        const offerExists = await Offer.findById(offer_id);
        if (!offerExists) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        // Check for an existing lead for the same user and offer
        const existingLead = await UserLead.findOne({ user_id, offer_id });
        if (existingLead) {
            return res.status(409).json({ message: 'Lead already exists for this offer and user.' });
        }

        // Create a new lead
        const newLead = new UserLead({
            user_id,
            offer_id,
            added_on: new Date()
        });

        await newLead.save();

        return res.status(201).json({ message: 'Lead submitted successfully.', lead: newLead });
    } catch (error) {
        console.error('Error submitting lead:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


