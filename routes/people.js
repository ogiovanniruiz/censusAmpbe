var express = require('express');
var router = express.Router();
var personController = require('../controllers/person.js')
var multer  = require('multer');
var upload = multer();

router.post('/getHouseHold', personController.getHouseHold);
router.post('/editPerson', personController.editPerson)
router.post('/createPerson', personController.createPerson)
router.post('/idPerson', personController.idPerson)
router.post('/getMembers', personController.getMembers)
router.post('/uploadMembership', [upload.any(), personController.uploadMembers])
router.post('/runMatch', personController.runMatch)

router.post('/finishIdentification', personController.finishIdentification)
router.post('/assignPreferredMethodOfContact', personController.assignPreferredMethodOfContact)
router.post('/assignTags', personController.assignTags)

module.exports = router;