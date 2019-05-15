var express = require('express');
var router = express.Router();
var parcelController = require('../controllers/parcel.js')

router.post('/getParcels', parcelController.getParcels);
router.post('/editParcel', parcelController.editParcel);
router.post('/createAsset', parcelController.createAsset);
router.post('/createParcel', parcelController.createParcel)

module.exports = router;