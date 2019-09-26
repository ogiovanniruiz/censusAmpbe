var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var phonebankController = require('../controllers/phonebank.js')

router.post('/getHouseHold', phonebankController.getHouseHold);
router.post('/getTwilioToken', phonebankController.getTwilioToken);
router.post('/call', twilio.webhook( {validate: false}),phonebankController.call)

module.exports = router;