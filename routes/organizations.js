var express = require('express');
var router = express.Router();
var orgController = require('../controllers/organization.js')
var multer  = require('multer');
var upload = multer();

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

router.post('/getOrgTags', orgController.getOrgTags);
router.post('/createTag', orgController.createTag);
router.post('/uploadLogo', [upload.any(),orgController.uploadLogo]);
router.post('/getOrgLogo',  orgController.getOrgLogo);

router.post('/createTwilioSubAccount',  orgController.createTwilioSubAccount);
router.post('/getOrgPhoneNumbers', orgController.getOrgPhoneNumbers);


module.exports = router;