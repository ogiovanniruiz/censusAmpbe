var express = require('express');
var router = express.Router();
var campaignController = require('../controllers/campaign.js')

router.post('/createCampaign', campaignController.createCampaign);
router.post('/getAllCampaigns', campaignController.getAllCampaigns)
router.post('/getCampaign', campaignController.getCampaign)
router.post('/requestCampaign', campaignController.requestCampaign)
router.post('/getOrgCampaigns', campaignController.getOrgCampaigns)
router.post('/getCampaignRequests', campaignController.getCampaignRequests)
router.post('/manageCampaignRequest', campaignController.manageCampaignRequest)
router.post('/removeOrg', campaignController.removeOrg)
router.post('/updateParentOrg', campaignController.updateParentOrg)
router.post('/getParentOrg', campaignController.getParentOrg)

module.exports = router;
