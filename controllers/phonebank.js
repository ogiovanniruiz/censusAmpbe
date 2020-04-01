const phonebankService = require('../services/phonebank.js')

const lockHouseHold = async (req,res,next) =>{
    try {
        res.send(await phonebankService.lockHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getTwilioToken = async (req,res,next) =>{
    try {
        res.send(await phonebankService.getTwilioToken(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const call = async (req,res,next) =>{
    try {
        res.send(await phonebankService.call(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editPerson = async (req,res,next) =>{
    try {
        res.send(await phonebankService.editPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createPerson = async (req,res,next) =>{
    try {
        res.send(await phonebankService.createPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const idPerson = async (req,res,next) =>{
    try {
        res.send(await phonebankService.idPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const nonResponse = async (req,res,next) =>{
    try {
        res.send(await phonebankService.nonResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const allocatePhoneNumber = async (req,res,next) =>{
    try {
        res.send(await phonebankService.allocatePhoneNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const completeHouseHold = async (req,res,next) =>{
    try {
        res.send(await phonebankService.completeHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getNumCompleted  = async (req, res, next) => {
    try {
        res.send(await phonebankService.getNumCompleted(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getLockedHouseHold  = async (req, res, next) => {
    try {
        res.send(await phonebankService.getLockedHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {
                getNumCompleted,
                getLockedHouseHold,
                lockHouseHold, 
                 getTwilioToken, 
                 call, 
                 editPerson, 
                 createPerson, 
                 idPerson, 
                 nonResponse, 
                 allocatePhoneNumber, 
                 completeHouseHold};