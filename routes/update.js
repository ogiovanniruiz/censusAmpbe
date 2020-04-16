var express = require('express');
var router = express.Router();
var updateController = require('../controllers/update.js')

router.post('/updateReport', updateController.updateReport);
router.post('/updateImpressions', updateController.updateImpressions);
router.post('/updateImpressions2', updateController.updateImpressions2);
router.post('/updateImpressions3', updateController.updateImpressions3);
router.post('/updateAddressGeocode', updateController.updateAddressGeocode);
module.exports = router;
