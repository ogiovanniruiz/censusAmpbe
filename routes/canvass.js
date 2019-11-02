var express = require('express');
var router = express.Router();
var canvassController = require('../controllers/canvass.js')

router.post('/getCanvassResidents', canvassController.getCanvassResidents);
router.post('/createPerson', canvassController.createPerson);
router.post('/idPerson', canvassController.idPerson);

module.exports = router;