var express = require('express');
var router = express.Router();
var canvassController = require('../controllers/canvass.js')

router.post('/getCanvassResidents', canvassController.getCanvassResidents);
router.post('/createPerson', canvassController.createPerson);
router.post('/idPerson', canvassController.idPerson);
router.post('/reverseGeocode', canvassController.reverseGeocode);
router.post('/getCanvassParcels', canvassController.getCanvassParcels);
router.post('/editPerson', canvassController.editPerson)
router.post('/addUnit', canvassController.addUnit)
module.exports = router;