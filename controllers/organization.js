const organizationService = require('../services/organization.js')

const createOrganization = async (req, res, next) => {
    try {
        res.send(await organizationService.createOrganization(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editOrganization = async (req, res, next) => {
    try {
        res.send(await organizationService.editOrganization(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getUserOrganizations = async (req, res, next) => {
    try {
        res.send(await organizationService.getUserOrganizations(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllOrganizations = async (req, res, next) => {
    try {
        res.send(await organizationService.getAllOrganizations(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOrganization = async (req, res, next) => {
    try {
        res.send(await organizationService.getOrganization(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const requestOrganization = async (req, res, next) => {
    try {
        res.send(await organizationService.requestOrganization(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOrgMembers = async (req, res, next) => {
    try {
        res.send(await organizationService.getOrgMembers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateOrgLevel = async (req, res, next) => {
    try {
        res.send(await organizationService.updateOrgLevel(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCampaignOrgs = async (req, res, next) => {
    try {
        res.send(await organizationService.getCampaignOrgs(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const dbPatch = async (req, res, next) => {
    try {
        res.send(await organizationService.dbPatch(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOrgTags= async (req, res, next) => {
    try {
        res.send(await organizationService.getOrgTags(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createTag = async (req, res, next) => {
    try {
        res.send(await organizationService.createTag(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const uploadLogo = async (req, res, next) => {
    try {
        res.send(await organizationService.uploadLogo(req))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOrgLogo = async (req, res, next) => {
    try {
        res.send(await organizationService.getOrgLogo(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createTwilioSubAccount = async (req, res, next) => {
    try {
        res.send(await organizationService.createTwilioSubAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}



const getOrgPhoneNumbers = async (req, res, next) => {
    try {
        res.send(await organizationService.getOrgPhoneNumbers(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const checkTwilioSubAccount = async (req, res, next) => {
    try {
        res.send(await organizationService.checkTwilioSubAccount(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}



const buyPhoneNumber = async (req, res, next) => {
    try {
        res.send(await organizationService.buyPhoneNumber(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const enableTexting = async (req, res, next) => {
    try {
        res.send(await organizationService.enableTexting(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCities = async (req, res, next) => {
    try {
        res.send(await organizationService.getCities(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}


module.exports = {
                getCities,
                checkTwilioSubAccount,
                buyPhoneNumber,
                createTwilioSubAccount,
                  createOrganization, 
                  getAllOrganizations, 
                  getOrganization, 
                  requestOrganization, 
                  getUserOrganizations, 
                  getOrgMembers, 
                  updateOrgLevel, 
                  getCampaignOrgs,
                  dbPatch,
                  editOrganization,  
                  enableTexting,                  
                  getOrgPhoneNumbers, createTag, getOrgTags, uploadLogo, getOrgLogo};