const userService = require('../services/user.js')

const loginUser = async (req, res, next) => {
    try {
        res.send(await userService.loginUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getUserProfile = async (req, res, next) => {
    try {
        res.send(await userService.getUserProfile(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const registerUser = async(req, res, next) => {
    try{
        res.send(await userService.registerUser(req.body));
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const passwordReset = async(req, res, next) => {
    try{
        res.send(await userService.passwordReset(req.body));
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const setNewPassword = async(req, res, next) => {
    try{
        res.send(await userService.setNewPassword(req.body));
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOauth = async (req, res, next) => {
    try {
        res.send(await userService.getOauth(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const registerOauth = async (req, res, next) => {
    try {
        res.send(await userService.registerOauth(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllUsers= async (req, res, next) => {
    try {
        res.send(await userService.getAllUsers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateUserLvl= async (req, res, next) => {
    try {
        res.send(await userService.updateUserLvl(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateDevStatus= async (req, res, next) => {
    try {
        res.send(await userService.updateDevStatus(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateAssetMapLvl= async (req, res, next) => {
    try {
        res.send(await userService.updateAssetMapLvl(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const deleteUser = async(req,res,next)=>{

    try {
        res.send(await userService.deleteUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editUser = async(req,res,next)=>{

    try {
        res.send(await userService.editUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const checkVersion = async(req,res,next)=>{

    try {
        res.send(await userService.checkVersion(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const submitAgreement = async(req,res,next)=>{

    try {
        res.send(await userService.submitAgreement(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}


const updateDataManager = async(req,res,next)=>{

    try {
        res.send(await userService.updateDataManager(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {checkVersion,
                  loginUser,
                  registerUser,
                  passwordReset,
                  setNewPassword,
                  getOauth,
                  registerOauth, 
                  getAllUsers, 
                  updateUserLvl, 
                  updateDevStatus, 
                  updateAssetMapLvl, 
                  getUserProfile, 
                  submitAgreement,
                  deleteUser, editUser, updateDataManager};
