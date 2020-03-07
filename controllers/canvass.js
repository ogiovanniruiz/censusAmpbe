const canvassService = require('../services/canvass.js')

const getCanvassPolygon = async (req, res, next) => {
    try {
        res.send(await canvassService.getCanvassPolygon(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

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

const editPerson  = async (req, res, next) => {
    try {
        res.send(await canvassService.editPerson(req.body))
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

const nonResponse  = async (req, res, next) => {
    try {
        res.send(await canvassService.nonResponse(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateMarkerLocation  = async (req, res, next) => {
    try {
        res.send(await canvassService.updateMarkerLocation(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}



module.exports = {getCanvassPolygon, getCanvassResidents, idPerson, createPerson, reverseGeocode, getCanvassParcels, editPerson, addUnit, nonResponse, updateMarkerLocation};

