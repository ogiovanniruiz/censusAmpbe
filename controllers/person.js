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




module.exports = {getHouseHold, editPerson, createPerson, idPerson};