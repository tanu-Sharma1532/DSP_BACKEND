const express = require('express');
const User = require('../../models/userModel/userModel');
const UserBalance = require('../../models/userModel/userBalanceModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const JWT_SECRET = require('../../services/config');
const mailSender = require('../../services/mailSender');
const { generate_OTP } = require('../../services/generatingOTP');
const resetPasswordOtpTemplate = require('../../template/OTPverify');
const welcomeEmailTemplate = require('../../template/WelcomeMail');
const passwordUpdateSuccessTemplate = require('../../template/passwordUpdate');

exports.createUser = async (req, res) => {
    try {
        const { name, email, mobile, password, referralCode } = req.body;

        // Check if user with given email or mobile already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

        if (existingUser) {
            if (existingUser.account_deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'Your account was deleted. Please contact the administrator to re-sign up.'
                });
            }
            return res.status(400).json({
                success: false,
                message: existingUser.email === email 
                    ? 'Email already exists. Use a different email ID.' 
                    : 'Mobile number already exists. Use a different mobile number.'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
            referralCode,
            createdOn: moment().tz('Asia/Kolkata').toDate()
        });
        await newUser.save();

        // Initialize user balance
        const userBalance = new UserBalance({
            user_id: newUser._id // Ensure this is passed as user_id
        });
        await userBalance.save();

        // Fetch user balance after saving
        const balance = await UserBalance.findOne({ user_id: newUser._id });

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

        // Send welcome email
        const emailTemplate = welcomeEmailTemplate(newUser.name);
        await mailSender(email, 'Welcome to the Platform!', emailTemplate);

        // Send full response with user and balance information
        res.status(201).json({
            success: true,
            user: {
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile,
                referralCode: newUser.referralCode,
                createdOn: newUser.createdOn,
                wallet_balance: balance.wallet_balance,
                total_earnings: balance.total_earnings,
                last_updated: balance.last_updated,
                token
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



exports.loginUserByEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.account_deleted) {
            return res.status(401).json({ success: false, message: "Invalid email or account not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.status(200).json({
            success: true,
            user: {
                userId: user._id,
                token,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.loginUserByMobile = async (req, res) => {
    try {
        const { mobile } = req.body;
        const user = await User.findOne({ mobile });

        if (!user || user.account_deleted) {
            return res.status(401).json({ success: false, message: "Invalid mobile number or account not found." });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.status(200).json({
            success: true,
            user: {
                userId: user._id,
                token,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.checkMobileExists = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        const user = await User.findOne({ mobile });
        res.status(200).json({
            success: true,
            exists: !!user,
            message: user ? 'Mobile number exists in the database' : 'Mobile number does not exist in the database'
        });
    } catch (err) {
        console.error('Error checking mobile number:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = generate_OTP(4);
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes validity
        await user.save();

        const emailTemplate = resetPasswordOtpTemplate(otp, user.name);
        await mailSender(email, 'Password Reset OTP', emailTemplate);

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findOne({ otp, otpExpiry: { $gte: new Date() } });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid User' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        await user.save();

        const emailTemplate = passwordUpdateSuccessTemplate(user.name);
        await mailSender(email, 'Password Updated Successfully', emailTemplate);

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};

exports.storeFirebaseToken = async (req, res) => {
    try {
        const { firebaseToken } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.firebaseToken = firebaseToken;
        await user.save();

        res.status(200).json({ success: true, message: 'Firebase token stored successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new passwords are required.' });
      }
  
      // Extract userId from the token (assuming middleware decoded the token)
      const userId = req.userId; // Middleware must populate this
  
      // Find the user by userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Check if the current password is correct
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while resetting the password.' });
    }
  };

  exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = generate_OTP(4);
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60000); 
        await user.save();

        const emailTemplate = resetPasswordOtpTemplate(otp , user.name);
        await mailSender(email, 'Password Reset OTP', emailTemplate);

        return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const {otp} = req.body;
        const user = await User.findOne({otp});
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        await user.save();
        res.status(200).json({ success: true, message: 'Valid OTP' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

exports.resetpassword = async(req,res) => {
    try{
        const{email,newPassword} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message:'Invalid User'});
        }
        user.password = await bcrypt.hash(newPassword,10);
        user.otp = undefined;
        await user.save();
        const emailTemplate = passwordUpdateSuccessTemplate(user.name);
        await mailSender(email, 'Password Updated Successfully', emailTemplate);
        res.status(200).json({success:true, message:'Password Reset Successfully'});
    }catch(error){
        console.log(error);
        res.status(500).json({success:true, message:'Error in resetting password'})
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params; // Get the userId from the URL parameters
        const { name, state, city, pincode, gender } = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update user fields
        user.name = name || user.name;
        user.state = state || user.state;
        user.city = city || user.city;
        user.pincode = pincode || user.pincode;
        user.gender = gender || user.gender;

        // Save the updated user
        const updatedUser = await user.save();

        // Convert user to plain object and remove emailVerification field
        const responseUser = updatedUser.toObject();
        delete responseUser.emailVerification;

        res.status(200).json({ message: 'Profile updated successfully.', user: responseUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
};

