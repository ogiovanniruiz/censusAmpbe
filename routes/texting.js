var express = require('express');
var router = express.Router();
var textingController = require('../controllers/texting.js')

router.post('/loadLockedPeople', textingController.loadLockedPeople);
router.post('/sendText', textingController.sendText);
router.post('/lockNewPeople', textingController.lockNewPeople);
router.post('/getRespondedPeople', textingController.getRespondedPeople);


module.exports = router;