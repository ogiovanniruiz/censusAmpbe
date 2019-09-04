var Organization = require('../models/organizations/organization'); 
var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')

const createOrganization = async(newOrgDetail) =>{   
    var orgDetail = { name: newOrgDetail.name,
                      description: newOrgDetail.description,
                      userIDs: [newOrgDetail.userID]
    }

    var organization = new Organization(orgDetail);
    organization.save();

    var person = await Person.findOne({'user._id': newOrgDetail.userID});
    person.user.userOrgs.push({level: "ADMINISTRATOR", orgID: organization._id});

    try {
        return person.save()        
    } catch(e){
        throw new Error(e.message)
    }
}

const editOrganization = async(detail) =>{

    var org = await Organization.findOne({"_id": detail.orgID})

    org.name = detail.name
    org.description = detail.description

    return org.save()
}


const getUserOrganizations = async(userDetail) =>{
    var orgArray = userDetail.user.userOrgs

    var adminOrgIds = orgArray.map(function(org) {
        if (org.level === "ADMINISTRATOR"){
            return org.orgID
        }
    })

    var leadOrgIds = orgArray.map(function(org) {
        if (org.level === "LEAD"){
            return org.orgID
        }
    })

    var volOrgIds = orgArray.map(function(org) {
        if (org.level === "VOLUNTEER"){
            return org.orgID
        }
    })

    var adminOrgs = await Organization.find({_id: {$in: adminOrgIds}})
    var leadOrgs = await Organization.find({_id: {$in: leadOrgIds}})
    var volOrgs = await Organization.find({_id: {$in: volOrgIds}})

    try {
        return {adminOrgs: adminOrgs, leadOrgs: leadOrgs, volOrgs: volOrgs}
    } catch(e){
        throw new Error(e.message)
    } 
}

const getAllOrganizations = async(userDetail) =>{
    var orgs = await Organization.find()

    try {
        return orgs
    } catch(e){
        throw new Error(e.message)
    } 
}

const requestOrganization = async(detail) =>{
    try{
        var person = await Person.findOne({'user._id': detail.userID})
        var org = await Organization.findOne({_id: detail.orgID})
        
        var userExists = await Organization.findOne({userIDs: person.user._id, _id: detail.orgID})
        if (userExists) return {msg:"User already Exists."}
        
        var requestExists = await Organization.findOne({requests: person.user._id, _id: detail.orgID})
        if(requestExists) return {msg:"Already Requested."}
        
        var userID = person.user._id
        org.requests.push(userID)

        return org.save()
        
    } catch(e){
        throw new Error(e.message)
    } 
}

const getOrganization = async(orgDetail) =>{
    try {
        return Organization.findOne({_id: orgDetail.orgID}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

const getOrgMembers = async(orgDetail) =>{

    var members = await Person.find({'user._id': {$in: orgDetail.userIDs}})
    var requests = await Person.find({'user._id': {$in: orgDetail.requests}})

    var memberList = {members: members, requests: requests}

    try {
        return memberList
    } catch(e){
        throw new Error(e.message)
    }    
}


const updateOrgLevel = async(detail) =>{

    var userID = detail.person.user._id
    var orgID = detail.org._id
    var status = detail.status

    var person = await Person.findOne({'user._id': userID})
    var org = await Organization.findOne({_id: detail.org._id})

    if (org.requests.includes(userID)){
        for( var i = 0; i < org.requests.length; i++){ 
            if (org.requests[i] === userID) {
                org.requests.splice(i, 1); 
            }
        } 
    } 

    for( var i = 0; i < org.userIDs.length; i++){ 
        if (org.userIDs[i] === userID) {
            org.userIDs.splice(i, 1); 
        }
    }

    if (status === "REMOVE"){
        for( var i = 0; i < person.user.userOrgs.length; i++){ 
            if (person.user.userOrgs[i].orgID === orgID) {
                person.user.userOrgs.splice(i,1)
            }
        }
    } else {

        org.userIDs.push(userID)
        var userOrgExists = false

        for( var i = 0; i < person.user.userOrgs.length; i++){ 
            if (person.user.userOrgs[i].orgID === orgID) {
                person.user.userOrgs[i].level = status
                userOrgExists = true
            }
        }

        if (userOrgExists === false){
            person.user.userOrgs.push({level: status, orgID: orgID})
        }
    }

    try {
        person.save()
        return org.save()
    } catch(e){
        throw new Error(e.message)
    }  
   
}


const getCampaignOrgs = async(campaignDetail) =>{
    
    var campaign = await Campaign.findOne({campaignID: campaignDetail.campaignID})
    var orgIDs = campaign.orgIDs
    var orgs = await Organization.find({_id: {$in: orgIDs}})

    try {
        return orgs
    } catch(e){
        throw new Error(e.message)
    }    
}

const dbPatch = async(detail) =>{

    var orgs = await Organization.find();
    var person = await Person.findOne({'user._id': detail.userID});

    for(var i = 0; i < orgs.length; i++){

        if(orgs[i].userIDs.includes(detail.userID)){

        }else{
    
            orgs[i].userIDs.push(detail.userID)
            orgs[i].save()
            person.user.userOrgs.push({level: "ADMINISTRATOR", orgID: orgs[i]._id})
            person.save()
        }
    }
}

module.exports = {createOrganization, 
                  editOrganization,
                  getAllOrganizations, 
                  getOrganization, 
                  requestOrganization, 
                  getUserOrganizations, 
                  getOrgMembers, 
                  updateOrgLevel,
                  getCampaignOrgs,
                  dbPatch}