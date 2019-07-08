var Target = require('../models/targets/target');
var Campaign = require('../models/campaigns/campaign'); 
var CensusTract = require('../models/censustracts/censustract'); 

const createTarget = async(targetDetail) =>{
    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid});

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

const lockTarget = async(targetDetail) =>{

    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid});

    for(var i = 0; i < tract.properties.targets.length; i++){
        if(tract.properties.targets[i].orgID != targetDetail.orgID){
            tract.properties.targets.splice(i, 1)
            console.log("REMOVED")
        }
    }

    for(var i = 0; i < tract.properties.targets.length; i++){
        if (tract.properties.targets[i].orgID === targetDetail.orgID){
            tract.properties.targets[i].targetType = "LOCKED";
            console.log("LOCKED")
        }
    }

    try{
        return tract.save();

    } catch(e){

        throw new Error(e.message)
    }

}

const removeTarget = async(targetDetail) => {

    var tract = await CensusTract.findOne({'properties.geoid': targetDetail.tractData.geoid});

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
        //console.log(targetDetail)
        return Target.find({}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createTarget, getAllTargets, removeTarget, lockTarget}