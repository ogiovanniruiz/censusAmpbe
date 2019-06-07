var Target = require('../models/targets/target');
var Campaign = require('../models/campaigns/campaign'); 

const createTarget = async(targetDetail) =>{
    
    
    console.log(targetDetail)

    var campaign = await Campaign.findOne({'campaignID': targetDetail.campaignID});

    var target = {title: targetDetail.tract.name,
                  targetType: "APPLIED",
                  params: targetDetail.tract.geoid}

    campaign.targets.push(target)
    console.log(campaign)

    
    try {
        //var target = new Target(targetDetail);
        return campaign.save();
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

module.exports = {createTarget, getAllTargets}