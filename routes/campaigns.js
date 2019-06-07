var express = require('express');
var router = express.Router();
var campaignController = require('../controllers/campaign.js')

router.post('/createCampaign', campaignController.createCampaign);
router.post('/getAllCampaigns', campaignController.getAllCampaigns)
router.post('/getCampaign', campaignController.getCampaign)
router.post('/requestCampaign', campaignController.requestCampaign)



module.exports = router;