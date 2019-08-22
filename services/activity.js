var Activity = require('../models/activities/activity')
var Campaign = require('../models/campaigns/campaign')
var Organization = require('../models/organizations/organization')
var CensusTract = require('../models/censustracts/censustract'); 

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
        var newActivity = {activityMetatData:{}}
        
        newActivity.activityMetaData = {
                                        name: detail.activityName,
                                        description:  detail.description,
                                        targetID:  detail.targetID,
                                        campaignID: detail.campaignID,
                                        orgIDs: [detail.orgID],
                                        createdBy: detail.createdBy,
                                        nonResponses: detail.nonResponses,
                                        activityScriptIDs: detail.activityScriptIDs
                                        }

        campaign.canvasActivities.push(newActivity)
    } else if (detail.activityType === "Event"){

        var locationName = ""


        

        for(var i = 0; i < detail.parcelData.properties.asset.idResponses.length; i++){

            console.log()

            if(detail.parcelData.properties.asset.idResponses[i].question === "Location Name"){
                locationName = detail.parcelData.properties.asset.idResponses[i].responses;

            }

        }

        var org = await Organization.findOne({"_id": detail.orgID})
        var blockGroup = await CensusTract.findOne({"geometry": {$geoIntersects: { $geometry: detail.parcelData.geometry}}})

        var newActivity = {activityMetatData:{},
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
    }

    try{
        return campaign.save()
    }catch(e){
        throw new Error(e.message)
    }

}

const editActivity = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvasActivities.length; i++){
            if( campaign.canvasActivities[i]._id.toString() === detail.activityID){
                campaign.canvasActivities[i].activityMetaData.name = detail.newActivityDetail.activityName
                campaign.canvasActivities[i].activityMetaData.description = detail.newActivityDetail.description
                campaign.canvasActivities[i].activityMetaData.targetID = detail.newActivityDetail.targetID
                campaign.canvasActivities[i].activityMetaData.nonResponses = detail.newActivityDetail.nonResponses
                campaign.canvasActivities[i].activityMetaData.activityScriptIDs = detail.newActivityDetail.activityScriptIDs
            }
        }
    } else if (detail.activityType === "Event"){
        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                campaign.eventActivities[i].swordForm = detail.newActivityDetail
            }
        }
    }
    return campaign.save()
}

const completeActivity = async(detail) =>{

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvasActivities.length; i++){
            if( campaign.canvasActivities[i]._id.toString() === detail.activityID){
                campaign.canvasActivities[i].activityMetaData.complete = true;
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

const getActivities = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    if(detail.activityType === "Canvass"){
        return campaign.canvasActivities
    } else if (detail.activityType === "Event"){
        return campaign.eventActivities
    }
}

const deleteActivity = async(detail) =>{

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvasActivities.length; i++){
            if( campaign.canvasActivities[i]._id.toString() === detail.activityID){
                campaign.canvasActivities.splice(i, 1); 
            }
        }
    } else if ( detail.activityType === "Event"){
        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                campaign.eventActivities.splice(i, 1); 
            }
        }
    }

    return campaign.save()
}

const getActivity = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    if(detail.activityType === "Canvass"){
        for(var i = 0; i < campaign.canvasActivities.length; i++){
            if( campaign.canvasActivities[i]._id.toString() === detail.activityID){
                return campaign.canvasActivities[i] 
            }
        }
    } else if(detail.activityType === "Event"){

        for(var i = 0; i < campaign.eventActivities.length; i++){
            if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                return campaign.eventActivities[i] 
            }
        }
    }
}

module.exports = {createActivity, getActivities, editActivity, deleteActivity, getActivity, completeActivity}