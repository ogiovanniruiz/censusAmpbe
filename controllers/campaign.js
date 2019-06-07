const campaignService = require('../services/campaign.js')

const createCampaign = async (req, res, next) => {
    try {
        res.send(await campaignService.createCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllCampaigns = async (req, res, next) => {
    try {
        res.send(await campaignService.getAllCampaigns(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCampaign = async (req, res, next) => {
    try {
        res.send(await campaignService.getCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const requestCampaign = async (req, res, next) => {
    try {
        res.send(await campaignService.requestCampaign(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}


module.exports = {createCampaign, getAllCampaigns, getCampaign, requestCampaign};