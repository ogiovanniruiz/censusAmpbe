var express = require('express');
var router = express.Router();
var textingController = require('../controllers/texting.js')

router.post('/loadLockedPeople', textingController.loadLockedPeople);
router.post('/sendText', textingController.sendText);
router.post('/lockNewPeople', textingController.lockNewPeople);
router.post('/getRespondedPeople', textingController.getRespondedPeople);
router.post('/receiveTexts', textingController.receiveTexts)
router.post('/updateConversation', textingController.updateConversation)
router.post('/getTextMetaData', textingController.getTextMetaData);
router.post('/getIdentifiedPeople', textingController.getIdentifiedPeople)
router.post('/allocatePhoneNumber', textingController.allocatePhoneNumber)
router.post('/resetTextBank', textingController.resetTextBank)

router.post('/idPerson', textingController.idPerson)
router.post('/nonResponse', textingController.nonResponse)
router.post('/completePerson', textingController.completePerson)
router.post('/getConversation', textingController.getConversation)

module.exports = router;