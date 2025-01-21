const express = require('express');
const router = express.Router();
const Leads = require('../../controllers/adminControllers/LeadStatusController');

router.post('/update/lead-status', Leads.updateGoalAndLeadStatusForUser);
router.get('/get-leads',Leads.getAllLeads);
router.get('/get-leads-byId/:id',Leads.getAllLeads);

module.exports = router;
