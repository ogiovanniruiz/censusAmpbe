var express = require('express');
var router = express.Router();
var censusTractController = require('../controllers/censusTract.js');
var multer  = require('multer');
var upload = multer();

router.post('/getAllCensusTracts', censusTractController.getAllCensusTracts);
router.post('/uploadOccupancy', [upload.any(), censusTractController.uploadOccupancy]);

module.exports = router;