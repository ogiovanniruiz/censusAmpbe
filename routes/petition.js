var express = require('express');
var router = express.Router();
var petitionController = require('../controllers/petition.js')
var multer  = require('multer');
var upload = multer();


router.post('/createPerson', petitionController.createPerson);
router.post('/updatePerson', petitionController.updatePerson);
router.post('/getNumSub', petitionController.getNumSub);
router.post('/generateLink', petitionController.generateLink);
router.post('/processLink', petitionController.processLink);
router.post('/uploadPetitions',  [upload.any(),petitionController.uploadPetitions]);

module.exports = router;