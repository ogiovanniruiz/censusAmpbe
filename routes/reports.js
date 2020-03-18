var express = require('express');
var router = express.Router();
var reportController = require('../controllers/report.js')

router.post('/updateReport', reportController.updateReport);
router.post('/getCanvassSummaryReport', reportController.getCanvassSummaryReport);
router.post('/getPetitionSummaryReport', reportController.getPetitionSummaryReport);
router.post('/getOverallSummaryReport', reportController.getOverallSummaryReport);
router.post('/getEventsSummaryReport', reportController.getEventsSummaryReport);
router.post('/getActivitiesSummaryReport', reportController.getActivitiesSummaryReport);
router.post('/getBlockGroupCanvassSummaryReport', reportController.getBlockGroupCanvassSummaryReport);
router.post('/getBlockGroupOverallSummaryReport', reportController.getBlockGroupOverallSummaryReport);
router.post('/getPhonebankingSummaryReport', reportController.getPhonebankingSummaryReport);
router.post('/getTextingSummaryReport', reportController.getTextingSummaryReport);
router.post('/getPhonebankingUserSummaryReport', reportController.getPhonebankingUserSummaryReport);

module.exports = router;
