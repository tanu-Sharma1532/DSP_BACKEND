const express = require('express');
const router = express.Router();
const Leads = require('../../controllers/adminControllers/LeadStatusController');

router.post('/update/lead-status', Leads.updateGoalAndLeadStatusForUser);

module.exports = router;
