var express = require('express');
var router = express.Router();
var targetController = require('../controllers/target.js')

router.post('/createCensusTarget', targetController.createCensusTarget);
router.post('/getAllTargets', targetController.getAllTargets)
router.post('/removeCensusTarget', targetController.removeCensusTarget)
router.post('/lockCensusTarget', targetController.lockCensusTarget)

router.post('/createAssetTarget', targetController.createAssetTarget)


module.exports = router;