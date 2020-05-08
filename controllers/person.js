const personService = require('../services/person.js')

const getHouseHold = async (req, res, next) => {
    try {
        res.send(await personService.getHouseHold(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editPerson = async (req, res, next) => {
    try {
        res.send(await personService.editPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createPerson = async (req, res, next) => {

    try {
        res.send(await personService.createPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const idPerson = async (req,res,next) =>{
    try {
        res.send(await personService.idPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getMembers = async (req,res,next) =>{
    try {
        res.send(await personService.getMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const uploadMembers = async (req,res,next) =>{
    try {
        
        res.send(await personService.uploadMembers(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const runMatch = async(req,res, next) => {
    try {
        res.send(await personService.runMatch(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const finishIdentification = async(req,res, next) => {
    try {
        res.send(await personService.finishIdentification(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}
const assignPreferredMethodOfContact = async(req,res, next) => {
    try {
        res.send(await personService.assignPreferredMethodOfContact(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const assignTags = async(req,res, next) => {
    try {
        res.send(await personService.assignTags(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const downloadContactHistory = async(req,res, next) => {
    try {
        res.send(await personService.downloadContactHistory(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const downloadAllContactData= async(req,res, next) => {
    try {
        res.send(await personService.downloadAllContactData(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}




module.exports = {downloadAllContactData,
    downloadContactHistory, getHouseHold, editPerson, createPerson, idPerson, getMembers, uploadMembers, runMatch, finishIdentification, assignPreferredMethodOfContact, assignTags};