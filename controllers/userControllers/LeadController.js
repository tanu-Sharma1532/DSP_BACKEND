const mongoose = require('mongoose');
const UserLead = require('../../models/adminModel/userLeadsModel');
const Offer = require('../../models/adminModel/offerModel'); 

exports.submitLead = async (req, res) => {
    try {
        const { user_id, offer_id, goal_id } = req.body;

        // Validate required fields
        if (!user_id || !offer_id) {
            return res.status(400).json({ message: 'User ID and Offer ID are required.' });
        }

        // Check if the offer exists
        const offer = await Offer.findById(offer_id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        // If goal_type is "multiple", validate the goal_id
        if (offer.goal_type === 'multiple') {
            if (!goal_id) {
                return res.status(400).json({ message: 'Goal ID is required for offers with multiple goals.' });
            }

            // Check if the goal_id exists within the offer's multiple_rewards
            const goalExists = offer.multiple_rewards.some(goal => goal._id.toString() === goal_id);
            if (!goalExists) {
                return res.status(404).json({ message: 'Invalid Goal ID.' });
            }
        }

        // Check for an existing lead for the same user, offer, and goal_id (if applicable)
        const existingLead = await UserLead.findOne({ 
            user_id, 
            offer_id, 
            ...(goal_id ? { 'goals.goal_id': goal_id } : {}) // Include goal_id in the query if applicable
        });

        if (existingLead) {
            return res.status(409).json({ message: 'Lead already exists for this offer, user, and goal.' });
        }

        // Create a new lead with goals array including goal_id
        const newLead = new UserLead({
            user_id,
            offer_id,
            lead_status: '1', // Set the lead_status to 1
            goals: goal_id ? [{ goal_id, goal_status: 1 }] : [], // Add the goal_id to the goals array if present
            added_on: new Date(),
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
      const formattedLeads = leads.map((lead) => {
        const offer = lead.offer_id;
        const brand = offer.brand;
    
        const goals = offer.multiple_rewards.map((goal) => {
            const userGoal = lead.goals.find((g) => String(g.goal_id) === String(goal._id));
            return {
                goal_name: goal.goal_name,
                goal_amount: goal.goal_amount,
                goal_description: goal.goal_description,
                goal_id: goal._id,
                goal_status: userGoal ? userGoal.goal_status : 0, // Default to 0 (Pending) if not found
            };
        });
    
        return {
            _id: lead._id,
            user_id: lead.user_id,
            offer_id: offer._id,
            offer_title: offer.title,
            offer_description: offer.description,
            brand_image: brand?.brand_image || null,
            goals,
            lead_status: lead.lead_status,
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



  