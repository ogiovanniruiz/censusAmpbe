var express = require('express');
var router = express.Router();
var activityController = require('../controllers/activity.js')

router.post('/createActivity', activityController.createActivity)
router.post('/getActivities', activityController.getActivities)
router.post('/editActivity', activityController.editActivity)
router.post('/deleteActivity', activityController.deleteActivity)
router.post('/getActivity', activityController.getActivity)
router.post('/completeActivity', activityController.completeActivity)
router.post('/activitySwordOutreachData', activityController.activitySwordOutreachData)
router.post('/sendSwordOutreach', activityController.sendSwordOutreach)
router.post('/activityTextImpressionsSwordOutreachData', activityController.activityTextImpressionsSwordOutreachData)
router.post('/sendTextImpressionsSwordOutreach', activityController.sendTextImpressionsSwordOutreach)
router.post('/releaseNumber', activityController.releaseNumber)
router.post('/resetActivity', activityController.resetActivity)
router.post('/getEvents', activityController.getEvents)
module.exports = router;
