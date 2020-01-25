var express = require('express');
var router = express.Router();
var reportController = require('../controllers/report.js')

router.post('/updateReport', reportController.updateReport);

module.exports = router;