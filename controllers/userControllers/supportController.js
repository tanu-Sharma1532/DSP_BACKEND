const Support = require('../../models/userModel/supportModel'); // Assuming the model is in this path
const User = require('../../models/userModel/userModel'); // User model for validation

// Create a new support message
exports.createSupportMessage = async (req, res) => {
  const { subject, message } = req.body;
  const userId = req.userId;  // Extracted from the middleware

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create a new support message
    const supportMessage = new Support({
      user_id: userId,
      subject,
      message,
      addedOn: new Date() // You can add more fields like 'addedOn' as needed
    });

    // Save the support message to the database
    await supportMessage.save();

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Support message created successfully',
      data: supportMessage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get all support messages for a user
exports.getSupportMessages = async (req, res) => {
  const userId = req.userId;  // Extracted from the middleware

  try {
    // Retrieve all support messages for the authenticated user
    const supportMessages = await Support.find({ user_id: userId }).sort({ addedOn: -1 });

    if (!supportMessages.length) {
      return res.status(404).json({ success: false, message: 'No support messages found' });
    }

    // Return the support messages
    res.status(200).json({
      success: true,
      message: 'Support messages retrieved successfully',
      data: supportMessages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
