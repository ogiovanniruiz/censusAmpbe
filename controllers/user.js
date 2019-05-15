const userService = require('../services/user.js')

const getUser = async (req, res, next) => {
    try {
        res.send(await userService.getUser(req.body))
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

const updateUser= async (req, res, next) => {
    try {
        res.send(await userService.updateUser(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {getUser, registerUser, getOauth, registerOauth, getAllUsers, updateUser};
