var Campaign = require('../models/campaigns/campaign')
var Organization = require('../models/organizations/organization')
var CensusTract = require('../models/censustracts/censustract');
const axios = require('axios');

const createActivity = async(detail) => {

    function format(value) {
        if (value > 12) {
            value = value - 12
            if (value === 12) { return value.toString() + "AM" } 
            else { return value.toString() + "PM" }
          } else {
            if (value === 12) { return value.toString() + "PM" } 
            else if(value === 0) { return (12).toString() + "AM" } 
            else { return value.toString() + "AM" }
          }
    }

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    

    if(detail.activityType === "Canvass"){
        var newActivity = {activityMetaData:{}}
        
        newActivity.activityMetaData = {
                                        name: detail.activityName,
                                        description:  detail.description,
                                        targetIDs:  detail.targetIDs,
                                        campaignID: detail.campaignID,
                                        orgIDs: [detail.orgID],
                                        createdBy: detail.createdBy,
                                        nonResponses: detail.nonResponses,
                                        activityScriptIDs: detail.activityScriptIDs
                                        }

        campaign.canvassActivities.push(newActivity)
    } else if(detail.activityType === "Phonebank"){

        var newActivity = {activityMetaData:{},
                           phoneNum: detail.selectedNumber}

        newActivity.activityMetaData = {
            name: detail.activityName,
            description:  detail.description,
            targetIDs:  detail.targetIDs,
            campaignID: detail.campaignID,
            orgIDs: [detail.orgID],
            createdBy: detail.createdBy,
            nonResponses: detail.nonResponses,
            activityScriptIDs: detail.activityScriptIDs
            }

            //for(var i = 0; i < campaign.phoneNumbers.length; i++){
            //    if(campaign.phoneNumbers[i].number === detail.selectedNumber){
            //      campaign.phoneNumbers[i].available = false
            //    }
            //}

            campaign.phonebankActivities.push(newActivity)

    }else if(detail.activityType === "Texting"){

        var phoneNumberObjs = []

        for(var i = 0; i < detail.selectedNumbers.length;  i++){
            phoneNumberObjs.push({number: detail.selectedNumbers[i]})
        }

        var newActivity = {
                           activityMetaData:{},
                           initTextMsg: detail.initTextMsg,
                           quickResponses: detail.quickResponses,
                           phoneNums: phoneNumberObjs
                        }

        newActivity.activityMetaData = {
                                        name: detail.activityName,
                                        description:  detail.description,
                                        targetIDs:  detail.targetIDs,
                                        campaignID: detail.campaignID,
                                        orgIDs: [detail.orgID],
                                        createdBy: detail.createdBy,
                                        nonResponses: detail.nonResponses,
                                        activityScriptIDs: detail.activityScriptIDs
                                        }
        var org = await Organization.findOne({"_id": detail.orgID})
        
        for(var i = 0; i < org.phoneNumbers.length; i++){
            if(detail.selectedNumbers.includes(org.phoneNumbers[i].number)){
                org.phoneNumbers[i].available = false
            }
        }

        org.save()

        campaign.textActivities.push(newActivity)

    } else if (detail.activityType === "Event"){

        var locationName = ""

        for(var i = 0; i < detail.parcelData.properties.asset.idResponses.length; i++){

            if(detail.parcelData.properties.asset.idResponses[i].question === "Location Name"){
                locationName = detail.parcelData.properties.asset.idResponses[i].responses;
            }
        }

        var org = await Organization.findOne({"_id": detail.orgID})
        var blockGroup = await CensusTract.findOne({"geometry": {$geoIntersects: { $geometry: detail.parcelData.geometry}}})

        var newActivity = {activityMetaData:{},
                           address: detail.parcelData.properties.address,
                           time: format(detail.startTime) + "-" + format(detail.endTime),
                           blockGroupID: blockGroup.properties.geoid,
                           orgCreatorName: org.name,
                           location: detail.parcelData.properties.location,
                           assetID: detail.parcelData._id,
                           locationName: locationName
                        }

        newActivity.activityMetaData = {
                                        name: detail.activityName,
                                        targetID:  detail.targetID,
                                        campaignID: detail.campaignID,
                                        orgIDs: [detail.orgID],
                                        createdBy: detail.createdBy,
                                        endDate: detail.date
                                        }

        campaign.eventActivities.push(newActivity)
    } else if(detail.activityType === "Petition"){

        var newActivity = {activityMetaData:{}}
        
        newActivity.activityMetaData = {
                                        name: detail.activityName,
                                        description:  detail.description,
                                        campaignID: detail.campaignID,
                                        orgIDs: [detail.orgID],
                                        createdBy: detail.createdBy,
                                        activityScriptIDs: detail.activityScriptIDs
                                        }

        console.log(newActivity.activityMetaData)

        campaign.petitionActivities.push(newActivity)

    }

    try{
        return campaign.save()
    }catch(e){
        throw new Error(e.message)
    }

}

const editActivity = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

   // console.log(campaign)

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvassActivities.length; i++){
            if( campaign.canvassActivities[i]._id.toString() === detail.activityID){
                campaign.canvassActivities[i].activityMetaData.name = detail.newActivityDetail.activityName
                campaign.canvassActivities[i].activityMetaData.description = detail.newActivityDetail.description
                campaign.canvassActivities[i].activityMetaData.targetIDs = detail.newActivityDetail.targetIDs
                campaign.canvassActivities[i].activityMetaData.nonResponses = detail.newActivityDetail.nonResponses
                campaign.canvassActivities[i].activityMetaData.activityScriptIDs = detail.newActivityDetail.activityScriptIDs
            }
        }
    } else if (detail.activityType === "Event"){
        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                campaign.eventActivities[i].swordForm = detail.newActivityDetail
            }
        }
    } else if(detail.activityType === "Texting"){

        for(var i = 0; i < campaign.textActivities.length; i++){

            var phoneNumberObjs = []

            for(var j = 0; j < detail.newActivityDetail.selectedNumbers.length;  j++){
                phoneNumberObjs.push({number: detail.newActivityDetail.selectedNumbers[j]})
            }

            var totalNumbers = campaign.textActivities[i].phoneNums.concat(phoneNumberObjs)
            
            
            if( campaign.textActivities[i]._id.toString() === detail.activityID){
                campaign.textActivities[i].activityMetaData.name = detail.newActivityDetail.activityName
                campaign.textActivities[i].activityMetaData.description = detail.newActivityDetail.description
                campaign.textActivities[i].activityMetaData.targetIDs = detail.newActivityDetail.targetIDs
                campaign.textActivities[i].activityMetaData.nonResponses = detail.newActivityDetail.nonResponses
                campaign.textActivities[i].activityMetaData.activityScriptIDs = detail.newActivityDetail.activityScriptIDs
                campaign.textActivities[i].quickResponses = detail.newActivityDetail.quickResponses
                campaign.textActivities[i].initTextMsg = detail.newActivityDetail.initTextMsg
                campaign.textActivities[i].phoneNums = totalNumbers
                campaign.textActivities[i].sendReceiverName = detail.newActivityDetail.sendReceiverName
                campaign.textActivities[i].sendSenderName = detail.newActivityDetail.sendSenderName
            }
        }

        var org = await Organization.findOne({"_id": detail.orgID})

        for(var i = 0; i < org.phoneNumbers.length; i++){
            if(detail.newActivityDetail.selectedNumbers.includes(org.phoneNumbers[i].number)){
                org.phoneNumbers[i].available = false
            }
        }
        org.save()

    }else if(detail.activityType === "Phonebank"){
        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                campaign.phonebankActivities[i].activityMetaData.name = detail.newActivityDetail.activityName
                campaign.phonebankActivities[i].activityMetaData.description = detail.newActivityDetail.description
                campaign.phonebankActivities[i].activityMetaData.targetIDs = detail.newActivityDetail.targetIDs
                campaign.phonebankActivities[i].activityMetaData.nonResponses = detail.newActivityDetail.nonResponses
                campaign.phonebankActivities[i].activityMetaData.activityScriptIDs = detail.newActivityDetail.activityScriptIDs
                campaign.phonebankActivities[i].phoneNum = detail.newActivityDetail.selectedNumber
            }
        }
    }else if(detail.activityType === "Petition"){
        for(var i = 0; i < campaign.petitionActivities.length; i++){
            if( campaign.petitionActivities[i]._id.toString() === detail.activityID){
                campaign.petitionActivities[i].activityMetaData.name = detail.newActivityDetail.activityName
                campaign.petitionActivities[i].activityMetaData.description = detail.newActivityDetail.description
            }
        }
    }



    return campaign.save()
}

const completeActivity = async(detail) =>{

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvasActivities.length; i++){
            if( campaign.canvassActivities[i]._id.toString() === detail.activityID){
                campaign.canvassActivities[i].activityMetaData.complete = true;
            }
        }
    } else if (detail.activityType === "Event"){
        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                campaign.eventActivities[i].activityMetaData.complete = true
            }
        }
    }

    return campaign.save()
}

const sendSwordOutreach = async(detail) =>{
    var swordOutreach = "https://swordoutreachapi.azurewebsites.net/report"
    var tokenStr = {headers: {'Content-Type': 'application/json', 'x-auth': 'fjkcxq3908daas43980120ahdnf2084mg048201a18nffl4'}};
    var data = await JSON.stringify(detail.report);

    var SwordOutreachResults = await axios.post(swordOutreach, data, tokenStr).then(response => {
        return response
    }).catch(error => {
        return error
    });

    return SwordOutreachResults
}

const getActivities = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    var activities = []

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvassActivities.length; i++){
            if(campaign.canvassActivities[i].activityMetaData.orgIDs.includes(detail.orgID)){
                activities.push(campaign.canvassActivities[i])
            }
        }
        return activities
    } else if (detail.activityType === "Event"){
        return campaign.eventActivities;
    } else if (detail.activityType === "Texting"){
        for(var i = 0; i < campaign.textActivities.length; i++){
            if(campaign.textActivities[i].activityMetaData.orgIDs.includes(detail.orgID)){
                activities.push(campaign.textActivities[i])
            }
        }
        return activities
    } else if (detail.activityType === "Phonebank"){
        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if(campaign.phonebankActivities[i].activityMetaData.orgIDs.includes(detail.orgID)){
                activities.push(campaign.phonebankActivities[i])
            }
        }
        return activities
    }else if (detail.activityType === "Petition"){
        for(var i = 0; i < campaign.petitionActivities.length; i++){
            if(campaign.petitionActivities[i].activityMetaData.orgIDs.includes(detail.orgID)){
                activities.push(campaign.petitionActivities[i])
            }
        }
        return activities
    }
}

const deleteActivity = async(detail) =>{

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvassActivities.length; i++){
            if( campaign.canvassActivities[i]._id.toString() === detail.activityID){
                campaign.canvassActivities.splice(i, 1); 
            }
        }
    } else if ( detail.activityType === "Event"){
        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                campaign.eventActivities.splice(i, 1); 
            }
        }
    }else if ( detail.activityType === "Petition"){
        for(var i = 0; i < campaign.petitionActivities.length; i++){
            if( campaign.petitionActivities[i]._id.toString() === detail.activityID){
                campaign.petitionActivities.splice(i, 1); 
            }
        }
    } 
    else if ( detail.activityType === "Texting"){

        var numbersToRelease = []
        for(var i = 0; i < campaign.textActivities.length; i++){
            if( campaign.textActivities[i]._id.toString() === detail.activityID){
                numbersToRelease = campaign.textActivities[i].phoneNums
                campaign.textActivities.splice(i, 1); 

            }
        }

        var org = await Organization.findOne({"_id": detail.orgID})
        
        for(var i = 0; i < org.phoneNumbers.length; i++){
            for (var j = 0; j < numbersToRelease.length; j++){

                if(numbersToRelease[j].number === org.phoneNumbers[i].number){
                    org.phoneNumbers[i].available = true
                }
            }

        }

        org.save()

    } else if (detail.activityType === "Phonebank"){
        var numberToRelease = ""
        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                numberToRelease = campaign.phonebankActivities[i].phoneNum
                campaign.phonebankActivities.splice(i, 1); 

            }
        }

        for(var j = 0; j < campaign.phoneNumbers.length; j++){
            if(campaign.phoneNumbers[j].number === numberToRelease){
                campaign.phoneNumbers[j].available = true
            }
        }


    }

    return campaign.save()
}

const getActivity = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvassActivities.length; i++){
            if( campaign.canvassActivities[i]._id.toString() === detail.activityID){
                return campaign.canvassActivities[i] 
            }
        }
    } else if(detail.activityType === "Event"){

        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                return campaign.eventActivities[i] 
            }
        }
    } else if(detail.activityType === "Texting"){

        for(var i = 0; i < campaign.textActivities.length; i++){
            if( campaign.textActivities[i]._id.toString() === detail.activityID){
                return campaign.textActivities[i] 
            }
        }
    }else if(detail.activityType === "Phonebank"){

        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                return campaign.phonebankActivities[i] 
            }
        }
    }else if(detail.activityType === "Petition"){

        for(var i = 0; i < campaign.petitionActivities.length; i++){
            if( campaign.petitionActivities[i]._id.toString() === detail.activityID){
                return campaign.petitionActivities[i] 
            }
        }
    }
}

module.exports = {createActivity, getActivities, editActivity, deleteActivity, getActivity, completeActivity, sendSwordOutreach}
