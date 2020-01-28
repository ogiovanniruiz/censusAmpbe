var express = require('express');
var router = express.Router();
var reportController = require('../controllers/report.js')

router.post('/updateReport', reportController.updateReport);
router.post('/getCanvassSummaryReport', reportController.getCanvassSummaryReport);
router.post('/getPetitionSummaryReport', reportController.getPetitionSummaryReport);
router.post('/getOverallSummaryReport', reportController.getOverallSummaryReport);

module.exports = router;
