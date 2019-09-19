const censustractService = require('../services/censusTract.js')

const getAllCensusTracts = async (req, res, next) => {
    try {
        res.send(await censustractService.getAllCensusTracts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const uploadOccupancy = async (req, res, next) => {
    try {
        res.send(await censustractService.uploadOccupancy(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {getAllCensusTracts, uploadOccupancy};