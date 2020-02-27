var Target = require('../models/targets/target');
var CensusTract = require('../models/censustracts/censustract'); 
var Person = require('../models/people/person')

const createTarget = async(detail) => {

    var newTarget = {properties: {   
                                targetName: "",
                                status: "",
                                orgID: detail.orgID,
                                campaignID: detail.campaignID,
                                userID: detail.userID,
                                params: {id: "", targetType: ""}
                                },
                    geometry:{},
                  
                    }

    if(detail.type === "CENSUSTRACT"){
        var tract = await CensusTract.findOne({'properties.geoid': detail.tractData.geoid});
        
        newTarget.properties.targetName = detail.tractData.geoid
        newTarget.properties.status = "REGISTERED"
        newTarget.geometry = tract.geometry
        newTarget.properties.params.id = detail.tractData.geoid
        newTarget.properties.params.targetType = detail.type
    
    } else if(detail.type === "NONGEOGRAPHIC"){

        newTarget.properties.targetName = detail.targetName
        newTarget.properties.status = "LOCKED" 
        newTarget.properties.params.targetType = detail.targetType;
        newTarget.properties.queries = []

        if(detail.targetType === "ORGMEMBERS"){
            
        }

        if(detail.precinct != ''){
            newTarget.properties.queries.push({queryType: "PRECINCT", param: detail.precinct})
        }

        if(detail.pav){
            newTarget.properties.queries.push({queryType: "PAV", param: detail.pav})
        }

        if(detail.parties.length > 0){
            for(var i = 0; i < detail.parties.length; i++){
                newTarget.properties.queries.push({queryType: "PARTY", param: detail.parties[i]})

            }
        }

        if(detail.hiPropensity != 100 && detail.lowPropensity != 0){
            newTarget.properties.queries.push({queryType: "PROPENSITY", param: detail.hiPropensity, subParam: detail.lowPropensity})
        }
        if(detail.members){
            newTarget.properties.queries.push({queryType: "ORGMEMBERS", param: detail.orgID})

        }

        


    } else if(detail.type === "POLYGON"){
    
        newTarget.properties.targetName = detail.targetName
        newTarget.geometry = {coordinates: [detail.geometry.coordinates], type: "MultiPolygon"}
        newTarget.properties.status = "LOCKED" 
        newTarget.properties.params.targetType = detail.type;
        newTarget.properties.queries = []

        if(detail.targetType === "ORGMEMBERS"){
            newTarget.properties.queries.push({queryType: detail.targetType, param: detail.orgID})
        } else if (detail.targetType === "SCRIPT"){
            newTarget.properties.queries.push({queryType: detail.targetType, param: detail.scriptID, subParam: detail.scriptResponseType})
            newTarget.properties.queries.push({queryType: detail.targetType, param: detail.scriptID, subParam: detail.scriptResponseType })
        } else if (detail.targetType === "TAG"){

            newTarget.properties.queries.push({queryType: detail.targetType, param: detail.tag })
        
        }
    
    }

    console.log(newTarget.properties.queries)

    var target = new Target(newTarget);

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

        if(detail.type === "CENSUSTRACT") {
            return Target.remove({'properties.orgID': detail.orgID, 'properties.campaignID': detail.campaignID, 'properties.params.id': detail.id}).exec();
        }

        if(detail.type === "POLYGON"){
            return Target.deleteOne({'_id': detail.id}).exec();

        }

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

const getParties = async() =>{
    var parties = await Person.distinct("voterInfo.party")
    return {parties: parties}
}

module.exports = { getParties,
                    getAllTargetProperties, 
                    removeTarget, 
                    lockTarget, 
                    createTarget, 
                    editTarget,
                    getAllTargets, 
                    unlockTarget,
                    getOrgTargets
                }