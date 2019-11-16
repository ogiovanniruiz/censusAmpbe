const canvassService = require('../services/canvass.js')

const getCanvassResidents = async (req, res, next) => {
    try {
        res.send(await canvassService.getCanvassResidents(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const idPerson = async (req, res, next) => {
    try {
        res.send(await canvassService.idPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createPerson  = async (req, res, next) => {
    try {
        res.send(await canvassService.createPerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const reverseGeocode  = async (req, res, next) => {
    try {
        res.send(await canvassService.reverseGeocode(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCanvassParcels  = async (req, res, next) => {
    try {
        res.send(await canvassService.getCanvassParcels(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const removePerson  = async (req, res, next) => {
    try {
        res.send(await canvassService.removePerson(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const addUnit  = async (req, res, next) => {
    try {
        res.send(await canvassService.addUnit(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}
module.exports = {getCanvassResidents, idPerson, createPerson, reverseGeocode, getCanvassParcels, removePerson, addUnit};