var express = require('express');
var router = express.Router();
var targetController = require('../controllers/target.js')

router.post('/createTarget', targetController.createTarget);
router.post('/getAllTargets', targetController.getAllTargets)
router.post('/removeTarget', targetController.removeTarget)
router.post('/lockTarget', targetController.lockTarget)


module.exports = router;