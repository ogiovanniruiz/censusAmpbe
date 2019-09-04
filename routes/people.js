var express = require('express');
var router = express.Router();
var personController = require('../controllers/person.js')

router.post('/getHouseHold', personController.getHouseHold);
router.post('/editPerson', personController.editPerson)
router.post('/createPerson', personController.createPerson)
router.post('/idPerson', personController.idPerson)


module.exports = router;