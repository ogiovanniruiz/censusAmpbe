var express = require('express');
var router = express.Router();
var canvassController = require('../controllers/canvass.js')

router.post('/getCanvassPolygon', canvassController.getCanvassPolygon);
router.post('/getCanvassResidents', canvassController.getCanvassResidents);
router.post('/createPerson', canvassController.createPerson);
router.post('/idPerson', canvassController.idPerson);
router.post('/reverseGeocode', canvassController.reverseGeocode);
router.post('/getCanvassParcels', canvassController.getCanvassParcels);
router.post('/removePerson', canvassController.removePerson)
router.post('/addUnit', canvassController.addUnit)
module.exports = router;
