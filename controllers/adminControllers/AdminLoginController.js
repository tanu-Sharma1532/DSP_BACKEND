const Admin = require('../../models/adminModel/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generate_OTP } = require('../../services/generatingOTP');
const mailSender = require('../../services/mailSender');
            
// Admin Signup
exports.signup = async (req, res) => {
    try {
        const { email, password, role } = req.body; // Destructure role from req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password"
            });
        }

        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin object with role from request body or default to 'admin'
        admin = new Admin({
            email,
            password: hashedPassword,
            role: role || 'admin', // Use provided role or default to 'admin'
        });

        await admin.save();
        res.status(201).json({
            success: true,
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role, // Include role in the response
            },
            message: "Admin created successfully",
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Sign up failed"
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the details carefully",
            });
        }

        // Find admin by email
        let admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin does not exist",
            });
        }

        // Prepare JWT payload
        const payload = {
            email: admin.email,
            id: admin._id,
            role: admin.role,
        };
        console.log("payload",payload);
        const JWT_SECRET = "123456";

        // Compare password
        if (await bcrypt.compare(password, admin.password)) {
            // Sign the JWT token
            let token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: "2h",
            });

            // Prepare admin object for response
            admin = admin.toObject();
            admin.token = token;
            admin.password = undefined;

            // Cookie options
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                httpOnly: true,
            };

            // Send response with token in cookie and in response body
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role, // Include role in response
                },
                message: "Admin logged in successfully"
            });
        } else {
            return res.status(403).json({
                success: false,
                message: "Password does not match",
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};


// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        const otp = generate_OTP(4);
        admin.otp = otp;
        admin.otpExpiry = new Date(Date.now() + 10 * 60000);
        await admin.save();
        await mailSender(email, 'Password Reset OTP', `We received a request to reset the password for your Cartvit account associated with this ${email}. To proceed with the password reset, please use the following One-Time Password (OTP): ${otp}. This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email, and your account will remain secure. For your security, do not share this OTP with anyone. If you need further assistance, feel free to contact our support team. Thank you for using Cartvit.`);
        res.status(200).json({ success: true, message: 'OTP sent successfully', otp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid admin' });
        }

        if (admin.otp !== Number(otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        admin.otp = undefined;
        await admin.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error in resetting password' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { newPassword, oldPassword } = req.body;
        const admin = await Admin.findOne({ email: req.email });
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid admin' });
        }
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error in changing password' });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.email });
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid admin' });
        }
        admin.accessToken = null;
        await admin.save();
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error in logout' });
    }
};
