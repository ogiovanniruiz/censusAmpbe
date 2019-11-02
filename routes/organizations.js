var express = require('express');
var router = express.Router();
var orgController = require('../controllers/organization.js')

router.post('/createOrganization', orgController.createOrganization);
router.post('/editOrganization', orgController.editOrganization);
router.post('/getAllOrganizations', orgController.getAllOrganizations)
router.post('/getOrganization', orgController.getOrganization)
router.post('/requestOrganization', orgController.requestOrganization)
router.post('/getUserOrganizations', orgController.getUserOrganizations)
router.post('/getOrgMembers', orgController.getOrgMembers)
router.post('/updateOrgLevel', orgController.updateOrgLevel)
router.post('/getCampaignOrgs', orgController.getCampaignOrgs)
router.post('/dbPatch', orgController.dbPatch)

router.post('/addPhoneNumber', orgController.addPhoneNumber);
router.post('/removePhoneNumber', orgController.removePhoneNumber);
router.post('/getOrgPhoneNumbers', orgController.getOrgPhoneNumbers);
router.post('/getAccountPhoneNumbers', orgController.getAccountPhoneNumbers);

router.post('/getOrgTags', orgController.getOrgTags);
router.post('/createTag', orgController.createTag);

module.exports = router;