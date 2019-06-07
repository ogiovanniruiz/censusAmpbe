var express = require('express');
var router = express.Router();
var censusTractController = require('../controllers/censusTract.js')

router.post('/getAllCensusTracts', censusTractController.getAllCensusTracts);

module.exports = router;