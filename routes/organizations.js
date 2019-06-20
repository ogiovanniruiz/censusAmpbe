var express = require('express');
var router = express.Router();
var orgController = require('../controllers/organization.js')

router.post('/createOrganization', orgController.createOrganization);
router.post('/getAllOrganizations', orgController.getAllOrganizations)
router.post('/getOrganization', orgController.getOrganization)
router.post('/requestOrganization', orgController.requestOrganization)
router.post('/getUserOrganizations', orgController.getUserOrganizations)
router.post('/getOrgMembers', orgController.getOrgMembers)
router.post('/updateOrgLevel', orgController.updateOrgLevel)

module.exports = router;