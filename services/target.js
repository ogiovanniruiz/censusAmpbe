var Target = require('../models/targets/target');
var Campaign = require('../models/campaigns/campaign'); 
var CensusTract = require('../models/censustracts/censustract'); 

const createTarget = async(detail) => {

    console.log(detail)

    var newTarget = {properties: {   
                                targetName: "",
                                status: "",
                                orgID: detail.orgID,
                                campaignID: detail.campaignID,
                                userID: detail.userID,
                                params: {id: "", targetType: ""}
                                },
                    geometry:{},
                    type: {}
                    }

    if(detail.type === "CENSUSTRACT"){
        var tract = await CensusTract.findOne({'properties.geoid': detail.tractData.geoid});
        newTarget.properties.targetName = detail.tractData.geoid
        newTarget.properties.status = "REGISTERED"
        newTarget.geometry = tract.geometry
        newTarget.type = tract.type
        newTarget.properties.params.id = detail.tractData.geoid
        newTarget.properties.params.targetType = detail.type
    } else if(detail.type === "NONGEOGRAPHIC"){

        newTarget.properties.targetName = detail.targetName
        newTarget.properties.status = "LOCKED" 
        newTarget.properties.params.targetType = detail.targetType;
        newTarget.type = ""

        if(detail.targetType === "ORGMEMBERS"){
            newTarget.properties.params.id = detail.orgID;
        } else if (detail.targetType === "SCRIPT"){
            newTarget.properties.params.id = detail.scriptID;
            newTarget.properties.params.subParam = detail.scriptResponseType
        }
    }

    var target = new Target(newTarget);

    console.log(target)

    try{
        return target.save()
    }catch(e){
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

const unlockTarget = async(detail) =>{
    var target = await Target.findOne({'properties.orgID': detail.orgID, 'properties.campaignID': detail.campaignID, 'properties.params.id': detail.tractData.geoid});
    target.properties.status = "REGISTERED"
    return target.save()

}

const getAllTargetProperties = async(targetDetail) =>{
    try {
        var targets = await Target.find({'properties.campaignID': targetDetail.campaignID});
        var targetProperties = targets.map(target=> target.properties)

        return targetProperties
    } catch(e){
        throw new Error(e.message)
    }
}

const getAllTargets = async(targetDetail) =>{
    try {
        var targets = await Target.find({'properties.campaignID': targetDetail.campaignID});
        
        return targets
    } catch(e){
        throw new Error(e.message)
    }
}

const getOrgTargets = async(targetDetail) =>{
    try {
        var targets = await Target.find({'properties.campaignID': targetDetail.campaignID, 'properties.orgID': targetDetail.orgID});
        
        return targets
    } catch(e){
        throw new Error(e.message)
    }
}

const editTarget = async (detail) => {

    console.log(detail)
}

module.exports = { 
                    getAllTargetProperties, 
                    removeTarget, 
                    lockTarget, 
                    createTarget, 
                    editTarget,
                    getAllTargets, 
                    unlockTarget,
                    getOrgTargets
                }