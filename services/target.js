var Target = require('../models/targets/target');
var Campaign = require('../models/campaigns/campaign'); 
var CensusTract = require('../models/censustracts/censustract'); 

const createTarget = async(detail) => {

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

    var timeRange = format(detail.startTime) + "-" + format(detail.endTime)

    var newTarget = {properties: {   
                                targetName: detail.targetName,
                                status: "REGISTERED",
                                orgID: detail.orgID,
                                campaignID: detail.campaignID,
                                userID: detail.userID,
                                params: {id: "", targetType: ""},
                                date: detail.date,
                                time: timeRange
                                },
                    geometry:{},
                    type: {}
                    }

    if(detail.type === "CENSUSTRACT"){
        var tract = await CensusTract.findOne({'properties.geoid': detail.tractData.geoid});
        newTarget.geometry = tract.geometry
        newTarget.type = tract.type
        newTarget.properties.params.id = detail.tractData.geoid
        newTarget.properties.params.targetType = detail.type

    } else if  (detail.type === "ASSET"){
        newTarget.properties.params.id = detail.tractData._id
        newTarget.properties.params.targetType = detail.type
        newTarget.type = "Feature"
        newTarget.geometry = detail.tractData.geometry
        
    }

    var target = new Target(newTarget);

    try{
        return target.save()
    }catch(e){
        throw new Error(e.message)
    }

}

const createCensusTarget = async(targetDetail) =>{
    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid, 'properties.name': targetDetail.tractData.name});

    var target = {
                  targetType: "APPLIED",
                  orgID: targetDetail.orgID,
                  campaignID: targetDetail.campaignID
                }

    tract.properties.targets.push(target)

    try {
         return tract.save();
    } catch(e){
        throw new Error(e.message)
    }
    
}

const lockTarget = async(detail) =>{
    var target = await Target.findOne({'properties.orgID': detail.orgID, 'properties.campaignID': detail.campaignID, 'properties.params.id': detail.tractData.geoid});
    target.properties.status = "LOCKED"
    var targetsToRemove = await Target.find({'properties.status': "REGISTERED", 'properties.campaignID': detail.campaignID, '_id': {$ne: target._id}, 'properties.params.id': detail.tractData.geoid})

    for(var i = 0; i < targetsToRemove.length; i++){targetsToRemove[i].remove()}

    try{
        return target.save()
    } catch(e){
        throw new Error(e.message)
    }
}

const removeTarget = async(detail) => {
    try{
        return Target.remove({'properties.orgID': detail.orgID, 'properties.campaignID': detail.campaignID, 'properties.params.id': detail.geoid}).exec();
    } catch(e){
        throw new Error(e.message)
    }
}

const getAllTargets = async(targetDetail) =>{
    try {
        var targets = await Target.find({'properties.campaignID': targetDetail.campaignID});
        var targetProperties = targets.map(target=> target.properties)

        return targetProperties
    } catch(e){
        throw new Error(e.message)
    }
}

const getAllAssetTargets = async(targetDetail) =>{
    try {
        var targets = await Target.find({'properties.campaignID': targetDetail.campaignID, 'properties.params.targetType': "ASSET"});
        var targetProperties = targets.map(target=> target.properties)

        return targetProperties
    } catch(e){
        throw new Error(e.message)
    }
}

const createAssetTarget = async (targetDetail) => {

    var campaign = await Campaign.findOne({'campaignID': targetDetail.campaignID});

    var target = {
                    targetType: "LOCKED",
                    orgID: targetDetail.orgID,
                    campaignID: targetDetail.campaignID,
                    params: {type: "ASSET", location: targetDetail.tractData.location}
                }

    campaign.targets.push(target)
    
    try {
        return campaign.save() 
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createCensusTarget, getAllTargets, removeTarget, lockTarget, createAssetTarget, createTarget, getAllAssetTargets}