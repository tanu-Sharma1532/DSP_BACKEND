const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/adminControllers/dashboard');

// Route to update lead status and goal
router.get('/data', dashboard.getDashboardData);

module.exports = router;
