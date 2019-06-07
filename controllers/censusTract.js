const campaignService = require('../services/censusTract.js')


const getAllCensusTracts = async (req, res, next) => {
    try {
        res.send(await campaignService.getAllCensusTracts(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {getAllCensusTracts};