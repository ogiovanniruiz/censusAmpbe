const targetService = require('../services/target.js')

const createTarget = async (req, res, next) => {
    try {
        res.send(await targetService.createTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllTargets = async (req, res, next) => {
    try {
        res.send(await targetService.getAllTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const removeTarget = async (req, res, next) => {
    try {
        res.send(await targetService.removeTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const lockTarget = async (req, res, next) => {
    try {
        res.send(await targetService.lockTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}



module.exports = {createTarget, getAllTargets, lockTarget, removeTarget};