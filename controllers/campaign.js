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

const getOrgCampaigns = async (req, res, next) => {
    try {
        res.send(await campaignService.getOrgCampaigns(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCampaignRequests = async (req, res, next) => {
    try {
        res.send(await campaignService.getCampaignRequests(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const manageCampaignRequest = async (req, res, next) => {
    try {
        res.send(await campaignService.manageCampaignRequest(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const removeOrg = async (req, res, next) => {
    try {
        res.send(await campaignService.removeOrg(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getReport = async (req, res, next) => {
    try {
        res.send(await campaignService.getReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOrgSummaryReport = async (req, res, next) => {
    try {
        res.send(await campaignService.getOrgSummaryReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getActivitiesSummaryReport = async (req, res, next) => {
    try {
        res.send(await campaignService.getActivitiesSummaryReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getscriptDetailsReport = async (req, res, next) => {
    try {
        res.send(await campaignService.getscriptDetailsReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCustomCrossTabReport = async (req, res, next) => {
    try {
        res.send(await campaignService.getCustomCrossTabReport(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {createCampaign, 
                  getAllCampaigns, 
                  getCampaign, 
                  requestCampaign, 
                  getOrgCampaigns, 
                  getCampaignRequests, 
                  manageCampaignRequest,
                  removeOrg,
                  getReport,
                  getOrgSummaryReport,
                  getActivitiesSummaryReport,
                  getscriptDetailsReport,
                  getCustomCrossTabReport
                };
