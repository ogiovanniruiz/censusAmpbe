var express = require('express');
var router = express.Router();
var userController = require('../controllers/user.js')

router.post('/getUser', userController.getUser);
router.post('/registerUser', userController.registerUser);
router.post('/getOauth', userController.getOauth);
router.post('/registerOauth', userController.registerOauth);

router.post('/getAllUsers', userController.getAllUsers)

router.post('/updateUser', userController.updateUser);
module.exports = router;