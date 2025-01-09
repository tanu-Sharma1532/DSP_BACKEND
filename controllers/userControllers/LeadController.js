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

        // Create a new lead with lead_status set to 1
        const newLead = new UserLead({
            user_id,
            offer_id,
            lead_status: '1', // Set the lead_status to 1
            added_on: new Date()
        });

        await newLead.save();

        return res.status(201).json({ message: 'Lead submitted successfully.', lead: newLead });
    } catch (error) {
        console.error('Error submitting lead:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getLeads = async (req, res) => {
  try {
      const { user_id } = req.params; // Get the user_id from the URL parameters

      // Validate user_id (optional but recommended)
      if (!user_id) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      // Find all leads where the user_id matches the given user_id
      const leads = await UserLead.find({ user_id })
          .populate({
              path: 'offer_id',
              select: 'title description multiple_rewards brand', // Include the 'brand' field for further population
              populate: {
                  path: 'brand',
                  select: 'brand_image', // Include only 'brand_image' from the Brand model
              },
          })
          .exec();

      // Check if leads are found
      if (leads.length === 0) {
          return res.status(404).json({ message: 'No leads found for this user' });
      }

      // Format the response to include the goals data, lead_status, brand_image, and payout
      const formattedLeads = leads.map(lead => {
          // Extracting the offer and goals information
          const offer = lead.offer_id;
          const brand = offer.brand;

          const goals = offer.multiple_rewards.map(goal => ({
              goal_name: goal.goal_name,
              goal_amount: goal.goal_amount,
              goal_description: goal.goal_description,
              goal_id: goal._id, // Including goal_id in the response
              goal_status: goal.goal_status, // Adding goal_status for each goal
          }));

          // Return the formatted lead with additional fields
          return {
              _id: lead._id,
              user_id: lead.user_id,
              offer_id: offer._id,
              offer_title: offer.title,
              offer_description: offer.description,
              brand_image: brand?.brand_image || null, // Include brand_image (fallback to null if not present)
              goals: goals, // Add the goals data
              lead_status: lead.lead_status, // Include lead_status
              added_on: lead.added_on,
          };
      });

      // Send the formatted leads in the response
      res.status(200).json(formattedLeads);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
};



  