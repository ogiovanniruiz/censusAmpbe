var express = require('express');
var router = express.Router();
var parcelController = require('../controllers/parcel.js')

router.post('/getParcels', parcelController.getParcels);
router.post('/editParcel', parcelController.editParcel);
router.post('/createAsset', parcelController.createAsset);
router.post('/createParcel', parcelController.createParcel);
router.post('/getAssets', parcelController.getAssets);
router.post('/deleteAsset', parcelController.deleteAsset);
router.post('/search', parcelController.search)

module.exports = router;