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
router.post('/getBlockGroupCanvassSummaryReport2', reportController.getBlockGroupCanvassSummaryReport2);
router.post('/getBlockGroupOrgSummaryReport', reportController.getBlockGroupOrgSummaryReport);
router.post('/getBlockGroupOrgSummaryReport2', reportController.getBlockGroupOrgSummaryReport2);
router.post('/getBlockGroupOverallSummaryReport', reportController.getBlockGroupOverallSummaryReport);
router.post('/getBlockGroupOverallSummaryReport2', reportController.getBlockGroupOverallSummaryReport2);

module.exports = router;
