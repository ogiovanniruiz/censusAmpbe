var express = require('express');
var router = express.Router();
var petitionController = require('../controllers/petition.js')


router.post('/createPerson', petitionController.createPerson);
router.post('/updatePerson', petitionController.updatePerson);
router.post('/getNumSub', petitionController.getNumSub);
router.post('/generateLink', petitionController.generateLink);
module.exports = router;