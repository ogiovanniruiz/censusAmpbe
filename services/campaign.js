var Campaign = require('../models/campaigns/campaign'); 
var Person = require('../models/people/person')
var Organization = require('../models/organizations/organization')
var mongoose = require('mongoose');
var Target = require('../models/targets/target')
var Script = require ('../models/campaigns/script')

const createCampaign = async(newCampaignDetail) =>{
    var campaignDetail = {name: newCampaignDetail.name,
                          description: newCampaignDetail.description,
                          orgIDs: [newCampaignDetail.orgID]
    }

    var campaign = new Campaign(campaignDetail);
    campaign.save()
    
    var org = await Organization.findOne({'_id': newCampaignDetail.orgID})
    org.campaignIDs.push(campaign.campaignID)

    try {
        return org.save()
          
    } catch(e){
        throw new Error(e.message)
    }

}

const getAllCampaigns = async(userDetail) =>{
    
    try {
        var person = await Person.findOne({'user._id': userDetail.userID}).lean()
        
        var orgIDs = person.user.userOrgs.map(x => mongoose.Types.ObjectId(x.orgID))
        var orgs = await Organization.find({_id: {$in: orgIDs}})
        
        var campaignIDs = orgs.map(x => x.campaignIDs)
        const flatIDs = campaignIDs.flat(1);

        return Campaign.find({campaignID: {$in: flatIDs}}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

const getOrgCampaigns = async(orgDetail) =>{
    try{
        var org = await Organization.findOne({_id: orgDetail.orgID})
        
        var campaignIDs = org.campaignIDs;
        return Campaign.find({campaignID: {$in: campaignIDs}}).exec(); 

    } catch(e){
        throw new Error(e.message)
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
        console.log(campaign)
        campaign.save()
        return org.save()
    } catch(e){
        throw new Error(e.message)
    }

}

const getReport = async(campaign) =>{

    var campaign = await Campaign.findOne({campaignID: campaign.campaignID})
    var knocksPerActivity = []

    for(var i = 0; i < campaign.canvassActivities.length; i++){
        var histories = await Person.find({"canvassContactHistory.activityID": campaign.canvassActivities[i]._id}).count()
        knocksPerActivity.push({knocks: histories, activity: campaign.canvassActivities[i].activityMetaData.name})
    }

    var orgIDs = campaign.orgIDs
    var orgs = await Organization.find({_id: {$in: orgIDs}})

    var knocksPerOrg = []

    for(var i = 0; i < orgs.length; i++){
        var histories = await Person.find({"canvassContactHistory.orgID": orgs[i]._id}).count()
        var totalRefused = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.refused": true }).count()
        var totalNonResponse = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.nonResponse": true ,  "canvassContactHistory.refused": false}).count()
        var totalCompleted = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": true }).count()
        knocksPerOrg.push({knocks: histories, org: orgs[i].name, completed: totalCompleted, refuses: totalRefused, nonResponses: totalNonResponse})
    }

    var totalCanvassEntries = await Person.find({"canvassContactHistory": { $exists: true, $not: {$size: 0}}}).count()

    var anomolies = await Person.find({"canvassContactHistory": { $exists: true, $not: {$size: 0}}, "address": { $exists: false}}).count()

    return {totalCanvassHistories: totalCanvassEntries, knocksPerOrg: knocksPerOrg, knocksPerActivity: knocksPerActivity, anomolies: anomolies}

}

const getOrgSummaryReport = async(details) =>{
    var campaign = await Campaign.findOne({campaignID: details.campaignID})

    var orgIDs = campaign.orgIDs
    var orgs = await Organization.find({_id: {$in: orgIDs}})

    var knocksPerOrg = []

    for(var i = 0; i < orgs.length; i++){
        if (details['reportType'] === 'org'){
            var totalIdentified = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": true }).count()
            var totalRefused = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": true }).count()
            var totalNonResponse = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": false, "canvassContactHistory.nonResponse": true}).count()
        }

        if (details['reportType'] === 'petition'){
            var totalIdentified = await Person.find({"petitionContactHistory.orgID": orgs[i]._id, "petitionContactHistory.identified": true }).count()
            var totalRefused = await Person.find({"petitionContactHistory.orgID": orgs[i]._id, "petitionContactHistory.identified": false, "petitionContactHistory.refused": true }).count()
            var totalNonResponse = await Person.find({"petitionContactHistory.orgID": orgs[i]._id, "petitionContactHistory.identified": false, "petitionContactHistory.refused": false, "petitionContactHistory.nonResponse": true}).count()
        }

        if (details['reportType'] === 'overall'){
            var cvTotalIdentified = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": true }).count()
            var cvTotalRefused = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": true }).count()
            var cvTotalNonResponse = await Person.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": false, "canvassContactHistory.nonResponse": true}).count()

            var ptTotalIdentified = await Person.find({"petitionContactHistory.orgID": orgs[i]._id, "petitionContactHistory.identified": true }).count()
            var ptTtotalRefused = await Person.find({"petitionContactHistory.orgID": orgs[i]._id, "petitionContactHistory.identified": false, "petitionContactHistory.refused": true }).count()
            var ptTtotalNonResponse = await Person.find({"petitionContactHistory.orgID": orgs[i]._id, "petitionContactHistory.identified": false, "petitionContactHistory.refused": false, "petitionContactHistory.nonResponse": true}).count()

            var totalIdentified = await parseInt(cvTotalIdentified) + parseInt(ptTotalIdentified)
            var totalRefused = await parseInt(cvTotalRefused) + parseInt(ptTtotalRefused)
            var totalNonResponse = await parseInt(cvTotalNonResponse) + parseInt(ptTtotalNonResponse)
        }

        var total = await parseInt(totalIdentified) + parseInt(totalRefused) + parseInt(totalNonResponse)
        await knocksPerOrg.push({org: orgs[i].name, identified: totalIdentified, refuses: totalRefused, nonResponses: totalNonResponse, total: total})
    }

    var identifiedTotals = 0;
    var refusedTotals = 0;
    var nonResponseTotals = 0;

    for(var i = 0; i < knocksPerOrg.length; i++){
        identifiedTotals += parseInt(knocksPerOrg[i].identified);
        refusedTotals += parseInt(knocksPerOrg[i].refuses);
        nonResponseTotals += parseInt(knocksPerOrg[i].nonResponses);
    }
    var totals = await parseInt(identifiedTotals) + parseInt(refusedTotals) + parseInt(nonResponseTotals)
    await knocksPerOrg.unshift({org: 'Total', identified: identifiedTotals, refuses: refusedTotals, nonResponses: nonResponseTotals, total: totals})

    return {knocksPerOrg: knocksPerOrg}
}

const getActivitiesSummaryReport = async(details) =>{
        canvassActivities = details.activities

        var knocks = []

        for(var i = 0; i < canvassActivities.length; i++){
            var totalIdentified = await Person.find({"canvassContactHistory.activityID": canvassActivities[i]._id, "canvassContactHistory.identified": true }).count()
            var totalRefused = await Person.find({"canvassContactHistory.activityID": canvassActivities[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": true }).count()
            var totalNonResponse = await Person.find({"canvassContactHistory.activityID": canvassActivities[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": false, "canvassContactHistory.nonResponse": true}).count()

            var total = await parseInt(totalIdentified) + parseInt(totalRefused) + parseInt(totalNonResponse)
            await knocks.push({identified: totalIdentified, total: total})
        }

    return {knocks: knocks}
}

const getCustomCrossTabReport = async(details, org, option1, option2) => {
    /*reports = [];

    if ((details.option1 === "Campaign" && details.option2 === "Script")|| (details.option1 === "Script" && details.option2 === "Campaign")){
        var campaignScript = await Script.find({campaignID: details.campaignID})
        await reports.push({report: campaignScript});
    }

    if ((details.option1 === "Org" && details.option2 === "Script")|| (details.option1 === "Script" && details.option2 === "Org")){
        var orgScript = await Script.find({orgID: details.orgID})
        await reports.push({report: orgScript});
    }

    if ((details.option1 === "Org" && details.option2 === "Summary")|| (details.option1 === "Summary" && details.option2 === "Org")){
        var orgSummary = await getOrgSummaryReport(details)
        await reports.push({report: orgSummary});
    }

    if ((details.option1 === "User" && details.option2 === "Script")|| (details.option1 === "Script" && details.option2 === "User")){
        var userScript = await Script.find({campaignID: details.campaignID})
        createdBy = []
        for (var i = 0; i < userScript.length; i++) {
            var persons =  await Person.find({'user._id': userScript[i].createdBy})
            await createdBy.push({firstName: persons[0].firstName, lastName: persons[0].lastName, script: userScript[i].title})
        }
        await reports.push({report: createdBy});
    }

    if ((details.option1 === "User" && details.option2 === "Summary")|| (details.option1 === "Summary" && details.option2 === "User")){
        var persons = await Person.find({"canvassContactHistory.campaignID": details.campaignID})
        var person = []
        for(var i = 0; i < persons.length; i++){
            await person.push({firstName: persons[i].firstName, lastName: persons[i].lastName})
        }
        await reports.push({report: person});
    }

    return reports*/
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
                  getCustomCrossTabReport
                }
