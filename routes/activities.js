var express = require('express');
var router = express.Router();
var activityController = require('../controllers/activity.js')

router.post('/createActivity', activityController.createActivity)
router.post('/getActivities', activityController.getActivities)
router.post('/editActivity', activityController.editActivity)
router.post('/deleteActivity', activityController.deleteActivity)
router.post('/getActivity', activityController.getActivity)
router.post('/completeActivity', activityController.completeActivity)

module.exports = router;