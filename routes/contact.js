var express = require('express');
var router = express.Router();
var contactController = require('../controllers/contact.js')

router.post('/sendEmail', contactController.sendEmail)

module.exports = router;