const petitionService = require('../services/petition.js')

const createPerson = async (req, res, next) => {
    try {
        res.send(await petitionService.createPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updatePerson = async (req, res, next) => {
    try {
        res.send(await petitionService.updatePerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getNumSub = async (req, res, next) => {
    try {
        res.send(await petitionService.getNumSub(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const generateLink = async (req, res, next) => {
    try {
        res.send(await petitionService.generateLink(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}


const processLink = async (req, res, next) => {
    try {
        res.send(await petitionService.processLink(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const uploadPetitions = async (req, res, next) => {
    try {
        res.send(await petitionService.uploadPetitions(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {createPerson, updatePerson, getNumSub, generateLink, processLink, uploadPetitions};