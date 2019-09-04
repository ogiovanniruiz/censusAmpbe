const textingService = require('../services/texting.js')

const loadLockedPeople = async (req,res,next) =>{
    try {
        res.send(await textingService.loadLockedPeople(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const sendText = async (req,res,next) =>{
    try {
        res.send(await textingService.sendText(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getRespondedPeople = async (req,res,next) =>{
    try {
        res.send(await textingService.getRespondedPeople(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const lockNewPeople = async (req,res,next) =>{
    try {
        res.send(await textingService.lockNewPeople(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {loadLockedPeople, sendText, lockNewPeople, getRespondedPeople};