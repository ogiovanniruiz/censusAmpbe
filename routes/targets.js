var express = require('express');
var router = express.Router();
var targetController = require('../controllers/target.js')

router.post('/getAllTargets', targetController.getAllTargets)
router.post('/getAllAssetTargets', targetController.getAllAssetTargets)
router.post('/removeTarget', targetController.removeTarget)
router.post('/lockTarget', targetController.lockTarget)

router.post('/createAssetTarget', targetController.createAssetTarget)

router.post('/createTarget', targetController.createTarget)


module.exports = router;