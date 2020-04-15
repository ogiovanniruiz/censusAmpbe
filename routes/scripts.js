var express = require('express');
var router = express.Router();
var scriptController = require('../controllers/script.js')

router.post('/createScript', scriptController.createScript);
router.post('/editScript', scriptController.editScript);
router.post('/getScript', scriptController.getScript);
router.post('/getAllScripts', scriptController.getAllScripts);
router.post('/deleteScript', scriptController.deleteScript);
router.post('/getActivityScripts', scriptController.getActivityScripts);
router.post('/getEveryScript', scriptController.getEveryScript);

module.exports = router;