const phonebankService = require('../services/phonebank.js')

const getHouseHold = async (req,res,next) =>{
    try {
        res.send(await phonebankService.getHouseHold(req.body))
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

module.exports = {getHouseHold, getTwilioToken, call};