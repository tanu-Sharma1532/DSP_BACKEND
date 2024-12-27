const express = require('express');
const path = require('path');
const router = express.Router();
const loginSignup = require('../controllers/userControllers/LoginSignUpcontroller');
const verifyToken = require('../services/verifyToken');
const balance = require('../controllers/userControllers/UserBalancecontroller');
const Support = require('../controllers/userControllers/supportController');

router.post('/submitUser', loginSignup.createUser);
router.post('/loginUserByEmail', loginSignup.loginUserByEmail);
router.post('/loginUserByMobile', loginSignup.loginUserByMobile);
// router.get('/userProfile', verifyToken, userBasic.getUserProfile);
// router.put('/updateUserProfile', verifyToken, upload.single('profile_pic') , userBasic.updateUserProfile);
router.post('/updatePassword', verifyToken, loginSignup.resetPassword);
// router.post('/delete-user',verifyToken,userBasic.deleteUser);
router.post('/storeFirebaseToken', verifyToken, loginSignup.storeFirebaseToken);

//Balance Routes
router.get('/getBalance',verifyToken,balance.getUserBalance);
router.post('/updateBalance',verifyToken,balance.updateUserBalance);
router.get('/balancehistory',verifyToken,balance.getBalanceHistory);

//Support Routes
router.post('/createsupport', verifyToken,Support.createSupportMessage);
router.get('/getsupport', verifyToken,Support.getSupportMessages);

module.exports = router;