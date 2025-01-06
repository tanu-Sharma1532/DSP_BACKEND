const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/adminControllers/AdminLoginController');
const adminAuth = require('../../services/adminauth');


router.post('/register-admin', adminAuthController.signup);
router.post('/login-admin', adminAuthController.login);
// forget password
router.post('/send-otp', adminAuthController.sendOTP);
router.post('/reset-password', adminAuthController.resetPassword);
router.post('/change-password', adminAuth.auth, adminAuthController.changePassword);
router.post('/logout',adminAuth.auth , adminAuthController.logout);

module.exports = router;