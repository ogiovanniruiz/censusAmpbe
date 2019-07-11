var Target = require('../models/targets/target');
var Campaign = require('../models/campaigns/campaign'); 
var CensusTract = require('../models/censustracts/censustract'); 

const createCensusTarget = async(targetDetail) =>{
    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid, 'properties.name': targetDetail.tractData.name});

    var target = {
                  targetType: "APPLIED",
                  orgID: targetDetail.orgID,
                  campaignID: targetDetail.campaignID}

    tract.properties.targets.push(target)

    try {
         return tract.save();
    } catch(e){
        throw new Error(e.message)
    }
    
}

const lockCensusTarget = async(targetDetail) =>{

    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid, 'properties.name': targetDetail.tractData.name});

    var lockedTargets = []

    for(var i = 0; i < tract.properties.targets.length; i++){

        if ((tract.properties.targets[i].orgID === targetDetail.orgID) && (tract.properties.targets[i].campaignID === targetDetail.campaignID)){
            tract.properties.targets[i].targetType = "LOCKED";
            lockedTargets.push(tract.properties.targets[i])
        }

        if (tract.properties.targets[i].campaignID != targetDetail.campaignID){
            lockedTargets.push(tract.properties.targets[i])
        }
    }

    try{
        tract.properties.targets = lockedTargets
        return tract.save();

    } catch(e){

        throw new Error(e.message)
    }

}

const removeCensusTarget = async(targetDetail) => {

    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid, 'properties.name': targetDetail.tractData.name});

    for(var i = 0; i < tract.properties.targets.length; i++){
        if(tract.properties.targets[i].orgID === targetDetail.orgID){
            tract.properties.targets.splice(i, 1)
        }
    }
    try{
        return tract.save();

    } catch(e){

        throw new Error(e.message)
    }
}

const getAllTargets = async(targetDetail) =>{
    try {
        var campaign = await Campaign.findOne({'campaignID': targetDetail.campaignID});

        return campaign.targets 
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

module.exports = {createCensusTarget, getAllTargets, removeCensusTarget, lockCensusTarget, createAssetTarget}