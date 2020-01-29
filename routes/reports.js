var express = require('express');
var router = express.Router();
var reportController = require('../controllers/report.js')

router.post('/updateReport', reportController.updateReport);
router.post('/getReport', reportController.getReport);
router.post('/getCanvassSummaryReport', reportController.getCanvassSummaryReport);
router.post('/getPetitionSummaryReport', reportController.getPetitionSummaryReport);
router.post('/getOverallSummaryReport', reportController.getOverallSummaryReport);
router.post('/getEventsSummaryReport', reportController.getEventsSummaryReport);
router.post('/getActivitiesSummaryReport', reportController.getActivitiesSummaryReport);

module.exports = router;
