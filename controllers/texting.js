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

const receiveTexts = async (req,res,next) =>{
    try {
        res.type('text/xml')
        res.send(await textingService.receiveTexts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateConversation = async (req,res,next) =>{
    try {
        res.send(await textingService.updateConversation(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const finishIdentification = async (req,res,next) =>{
    try {
        res.send(await textingService.finishIdentification(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getTextMetaData = async (req,res,next) =>{
    try {
        res.send(await textingService.getTextMetaData(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getIdentifiedPeople = async (req,res,next) =>{
    try {
        res.send(await textingService.getIdentifiedPeople(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}


const allocatePhoneNumber = async (req,res,next) =>{
    try {
        res.send(await textingService.allocatePhoneNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {loadLockedPeople, 
    sendText, 
    lockNewPeople, 
    getRespondedPeople, 
    receiveTexts, 
    updateConversation, 
    finishIdentification, 
    getTextMetaData,
getIdentifiedPeople,
allocatePhoneNumber


};