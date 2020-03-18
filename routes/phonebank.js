var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var phonebankController = require('../controllers/phonebank.js')

router.post('/getHouseHold', phonebankController.getHouseHold);
router.post('/getTwilioToken', phonebankController.getTwilioToken);
router.post('/call', twilio.webhook( {validate: false}),phonebankController.call)

router.post('/createPerson', phonebankController.createPerson);
router.post('/idPerson', phonebankController.idPerson);
router.post('/editPerson', phonebankController.editPerson);
router.post('/nonResponse', phonebankController.nonResponse);
router.post('/allocatePhoneNumber', phonebankController.allocatePhoneNumber);
router.post('/completeHouseHold', phonebankController.completeHouseHold);
router.post('/getNumCompleted', phonebankController.getNumCompleted);
router.post('/getLockedHouseHold', phonebankController.getLockedHouseHold);
module.exports = router;