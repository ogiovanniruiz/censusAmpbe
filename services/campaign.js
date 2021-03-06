var Campaign = require('../models/campaigns/campaign'); 
var Person = require('../models/people/person')
var Organization = require('../models/organizations/organization')
var mongoose = require('mongoose');
var Target = require('../models/targets/target')

const createCampaign = async(newCampaignDetail) =>{
    var campaignDetail = {name: newCampaignDetail.name,
                          description: newCampaignDetail.description,
                          orgIDs: [newCampaignDetail.orgID],
                          dataManagers: [newCampaignDetail.userID],
                          //thirdParty: newCampaignDetail.thirdParty

    }

    var campaign = new Campaign(campaignDetail);
    campaign.save();
    
    var org = await Organization.findOne({'_id': newCampaignDetail.orgID});
    org.campaignIDs.push(campaign.campaignID);

    try {
        return org.save();
          
    } catch(e){
        throw new Error(e.message);
    }
}

const getAllCampaigns = async(userDetail) =>{
    try {
        var person = await Person.findOne({'user._id': userDetail.userID}).lean();
        
        var orgIDs = person.user.userOrgs.map(x => mongoose.Types.ObjectId(x.orgID));
        var orgs = await Organization.find({_id: {$in: orgIDs}});
        
        var campaignIDs = orgs.map(x => x.campaignIDs);
        const flatIDs = campaignIDs.flat(1);

        return Campaign.find({campaignID: {$in: flatIDs}}).exec(); 
    } catch(e){
        throw new Error(e.message);
    }
}

const getOrgCampaigns = async(orgDetail) =>{
    try{
        var org = await Organization.findOne({_id: orgDetail.orgID});
        
        var campaignIDs = org.campaignIDs;
        return Campaign.find({campaignID: {$in: campaignIDs}}).exec(); 

    } catch(e){
        throw new Error(e.message);
    }
}

const requestCampaign = async(detail) =>{

    try{
        var org = await Organization.findOne({_id: detail.orgID})
        var campaign = await Campaign.findOne({campaignID: detail.campaignID})
        if (!campaign) return {msg:"Campaign does not exist."}
        
        var orgIsCampaignMember = await Campaign.findOne({orgIDs: detail.orgID, campaignID: detail.campaignID})
        if (orgIsCampaignMember) return {msg:"Oranization is already a member of this campaign."}

        var campaignIsRequested = await Campaign.findOne({requests: detail.orgID, campaignID: detail.campaignID})
        if (campaignIsRequested ) return {msg:"Request has already been sent to this campaign."}
        
        campaign.requests.push(detail.orgID)

        return campaign.save()
    } catch(e){
        throw new Error(e.message)
    }
}

const getCampaignRequests = async(campaignDetail) =>{
    var campaign = await Campaign.findOne({campaignID: campaignDetail.campaignID}); 
    var requests = campaign.requests;
    var orgs = await Organization.find({_id: {$in: requests}})

    try {
        return orgs
    } catch(e){
        throw new Error(e.message)
    }
}

const manageCampaignRequest = async(detail) =>{

    var orgID = detail.orgID
    var campaignID = detail.campaignID

    var campaign = await Campaign.findOne({campaignID: campaignID})
    var org = await Organization.findOne({_id: detail.orgID})

    if (campaign.requests.includes(orgID)){
        for( var i = 0; i < campaign.requests.length; i++){ 
            if (campaign.requests[i] === orgID) {
                campaign.requests.splice(i, 1); 
            }
        } 
    }

    try {

        if(detail.action === 'APPROVE'){
            campaign.orgIDs.push(orgID)
            org.campaignIDs.push(campaignID)
            org.save()
            return campaign.save()
        }else {
            return campaign.save()
        }

    } catch(e){
        throw new Error(e.message)
    }
}

const getCampaign = async(campaignDetail) =>{
    try {
        return Campaign.findOne({campaignID: campaignDetail.campaignID}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

const removeOrg = async(detail) =>{
    var orgID = detail.orgID
    var campaignID = detail.campaignID

    var campaign = await Campaign.findOne({campaignID: campaignID})
    var org = await Organization.findOne({_id: detail.orgID})

    if (campaign.orgIDs.includes(orgID)){
        for( var i = 0; i < campaign.orgIDs.length; i++){ 
            if (campaign.orgIDs[i] === orgID) {
                campaign.orgIDs.splice(i, 1); 
            }
        } 
    }

    if (org.campaignIDs.includes(campaignID)){
        for( var i = 0; i < org.campaignIDs.length; i++){ 
            if (org.campaignIDs[i] === campaignID.toString()) {
                org.campaignIDs.splice(i, 1); 
            }
        } 
    }

    Target.remove({'properties.orgID': detail.orgID, 'properties.campaignID': detail.campaignID}).exec();

    try {
        campaign.save()
        return org.save()
    } catch(e){
        throw new Error(e.message)
    }

}

const updateParentOrg = async(detail) =>{
    try {
        var campaign = await Campaign.findOne({campaignID: detail.campaignID});
        campaign.parentOrg = detail.newParentOrg;
        campaign.save();

    } catch(e){
        throw new Error(e.message)
    }
}

const getParentOrg = async(campaignDetail) =>{
    try {
        var campaign = await Campaign.findOne({campaignID: campaignDetail.campaignID})
        return {parentOrg: campaign.parentOrg}
    } catch(e){
        throw new Error(e.message)
    }
}


module.exports = {createCampaign,
                  getParentOrg,
                  updateParentOrg,
                  getAllCampaigns, 
                  getCampaign, 
                  requestCampaign, 
                  getOrgCampaigns, 
                  getCampaignRequests, 
                  manageCampaignRequest,
                  removeOrg}
