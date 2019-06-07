var Campaign = require('../models/campaigns/campaign'); 
var Person = require('../models/people/person')

const createCampaign = async(newCampaignDetail) =>{
    var campaignDetail = {name: newCampaignDetail.name,
                          description: newCampaignDetail.description,
                          userIDs: [newCampaignDetail.userID]
    }

    var campaign = new Campaign(campaignDetail);
    campaign.save()

    var person = await Person.findOne({'user._id': newCampaignDetail.userID})
    person.user.userCampaigns.push({level: "ADMINISTRATOR", campaignID: campaign.campaignID})

    try {
        return  person.save()        
        
    } catch(e){
        throw new Error(e.message)
    }
}


const getAllCampaigns = async(userDetail) =>{
    try {
        return Campaign.find({userIDs: userDetail.userID}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

const addCampaignUser = async(detail) =>{}

const requestCampaign = async(detail) =>{
    try{
        var person = await Person.findOne({'user._id': detail.userID})
        
        var campaign = await Campaign.findOne({campaignID: detail.campaignID})
        if (!campaign) return {msg:"Campaign does not exist."}
        
        var userExists = await Campaign.findOne({userIDs: person.user._id})
        if (userExists) return {msg:"User already Exists."}
        
        var requestExists = await Campaign.findOne({requests: person.user})
        if(requestExists) return {msg:"Already Requested."}
        
        campaign.requests.push(person.user)
        return campaign.save()
        
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

module.exports = {createCampaign, getAllCampaigns, getCampaign, addCampaignUser, requestCampaign}
