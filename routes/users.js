var express = require('express');
var router = express.Router();
var userController = require('../controllers/user.js')

router.post('/loginUser', userController.loginUser);
router.post('/getUserProfile', userController.getUserProfile);

router.post('/registerUser', userController.registerUser);
router.post('/setNewPassword', userController.setNewPassword);
router.post('/passwordReset', userController.passwordReset);
router.post('/getOauth', userController.getOauth);
router.post('/registerOauth', userController.registerOauth);

router.post('/getAllUsers', userController.getAllUsers)

router.post('/updateUserLvl', userController.updateUserLvl);
router.post('/updateDevStatus', userController.updateDevStatus);
router.post('/updateAssetMapLvl', userController.updateAssetMapLvl)

router.post('/deleteUser', userController.deleteUser);
router.post('/editeUser', userController.editUser);

router.post('/checkVersion', userController.checkVersion);

router.post('/submitAgreement', userController.submitAgreement);

router.post('/updateDataManager', userController.updateDataManager);
module.exports = router;
