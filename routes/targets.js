var express = require('express');
var router = express.Router();
var targetController = require('../controllers/target.js')

router.post('/createTarget', targetController.createTarget);
router.post('/getAllTargets', targetController.getAllTargets)


module.exports = router;