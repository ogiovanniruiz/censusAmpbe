const organizationService = require('../services/organization.js')

const createOrganization = async (req, res, next) => {
    try {
        res.send(await organizationService.createOrganization(req.body))
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

module.exports = {createOrganization, getAllOrganizations, getOrganization, requestOrganization, getUserOrganizations, getOrgMembers, updateOrgLevel, getCampaignOrgs};