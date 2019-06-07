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

module.exports = {loginUser, registerUser, getOauth, registerOauth, getAllUsers, updateUserLvl, updateDevStatus, updateAssetMapLvl, getUserProfile};
