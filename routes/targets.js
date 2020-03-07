var express = require('express');
var router = express.Router();
var targetController = require('../controllers/target.js')

router.post('/getAllTargetProperties', targetController.getAllTargetProperties)
router.post('/getAllTargets', targetController.getAllTargets)
router.post('/getOrgTargets', targetController.getOrgTargets)
router.post('/removeTarget', targetController.removeTarget)
router.post('/lockTarget', targetController.lockTarget)
router.post('/createTarget', targetController.createTarget)
router.post('/editTarget', targetController.editTarget)
router.post('/unlockTarget', targetController.unlockTarget)
router.post('/getParties', targetController.getParties)
module.exports = router;