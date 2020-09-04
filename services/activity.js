var Campaign = require('../models/campaigns/campaign');
var Organization = require('../models/organizations/organization');
var CensusTract = require('../models/censustracts/censustract');
var People = require ('../models/people/person');
const axios = require('axios');


const resetActivity = async(detail) =>{

    if(detail.activityType === "Texting"){
        var people = await People.find({"textContactHistory": { $elemMatch: {activityID: detail.activityID}}});
        
        for(var i = 0; i <  people.length; i++){
            people[i].textable = '?'
    
            for(var j = 0; j < people[i].textContactHistory.length; j++){
                if(people[i].textContactHistory[j].activityID === detail.activityID){
                    people[i].textContactHistory.splice(j,1)
                    people[i].save()
                }
            }
        }

        return people

    }else if(detail.activityType === "Phonebank"){
        var people = await People.find({"phonebankContactHistory": { $elemMatch: {activityID: detail.activityID}}});
        for(var i = 0; i <  people.length; i++){
    
            for(var j = 0; j < people[i].phonebankContactHistory.length; j++){
                if(people[i].phonebankContactHistory[j].activityID === detail.activityID){
                    people[i].phonebankContactHistory.splice(j,1)
                    people[i].save()
                }
            }
        }

        return people
    }

}



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
        var phoneNumberObjs = []

        for(var i = 0; i < detail.selectedNumbers.length;  i++){
            phoneNumberObjs.push({number: detail.selectedNumbers[i]})
        }

        var newActivity = {activityMetaData:{   
                                                name: detail.activityName,
                                                description:  detail.description,
                                                targetIDs:  detail.targetIDs,
                                                campaignID: detail.campaignID,
                                                orgIDs: [detail.orgID],
                                                createdBy: detail.createdBy,
                                                nonResponses: detail.nonResponses,
                                                activityScriptIDs: detail.activityScriptIDs
                                            },
                           phoneNums: phoneNumberObjs
                            }

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

        
        var blockGroup = await CensusTract.findOne({"geometry": {$geoIntersects: { $geometry: detail.parcelData.properties.location}}})

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

        /*
        var org = await Organization.findOne({"_id": detail.orgID})

        for(var i = 0; i < org.phoneNumbers.length; i++){
            if(detail.newActivityDetail.selectedNumbers.includes(org.phoneNumbers[i].number)){
                org.phoneNumbers[i].available = false
            }
        }
        org.save()
        */

    }else if(detail.activityType === "Phonebank"){

        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                campaign.phonebankActivities[i].activityMetaData.name = detail.newActivityDetail.activityName
                campaign.phonebankActivities[i].activityMetaData.description = detail.newActivityDetail.description
                campaign.phonebankActivities[i].activityMetaData.nonResponses = detail.newActivityDetail.nonResponses
                campaign.phonebankActivities[i].phoneNums.concat(phoneNumberObjs)
                campaign.phonebankActivities[i].activityMetaData.activityScriptIDs = detail.newActivityDetail.activityScriptIDs
            
                for(var j = 0; j < detail.newActivityDetail.selectedNumbers.length;  j++){
                    campaign.phonebankActivities[i].phoneNums.push({number: detail.newActivityDetail.selectedNumbers[j]})
                }
                break
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
        for(var i = 0; i < campaign.canvassActivities.length; i++){
            if( campaign.canvassActivities[i]._id.toString() === detail.activityID){
                campaign.canvassActivities[i].activityMetaData.complete = true;
            }
        }
    } else if (detail.activityType === "Phonebank"){
        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                campaign.phonebankActivities[i].activityMetaData.complete = true
            }
        }
    } else if (detail.activityType === "Texting"){
        for(var i = 0; i < campaign.textActivities.length; i++){
            if( campaign.textActivities[i]._id.toString() === detail.activityID){
                campaign.textActivities[i].activityMetaData.complete = true
            }
        }
    } else if (detail.activityType === "Petition"){
        for(var i = 0; i < campaign.petitionActivities.length; i++){
            if( campaign.petitionActivities[i]._id.toString() === detail.activityID){
                campaign.petitionActivities[i].activityMetaData.complete = true
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

const activitySwordOutreachData = async(details) => {
    const agg = (() => {
        if (details.activityType === "Canvass") {
            return [
                {
                    '$match': {
                        'canvassContactHistory.campaignID': details.campaignID,
                        'canvassContactHistory.orgID': details.orgID,
                        'canvassContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$canvassContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'canvassContactHistory.campaignID': details.campaignID,
                        'canvassContactHistory.orgID': details.orgID,
                        'canvassContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$canvassContactHistory.idHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$group': {
                        '_id': '$address.blockgroupID',
                        'blockgroups': {
                            '$push': {
                                '$arrayElemAt': [
                                    '$$ROOT.canvassContactHistory.idHistory.idResponses', 0
                                ]
                            }
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$blockgroups'
                    }
                }, {
                    '$project': {
                        'blockgroups': 1,
                        'positive': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'POSITIVE'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'neutral': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEUTRAL'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'negative': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEGATIVE'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'impressions': {
                            '$cond': {
                                'if': {
                                    '$regexFind': {
                                        'input': "$blockgroups.responses",
                                        'regex': '(?i)lit|imp|con|spanish|und'
                                    }
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'positive': {
                            '$sum': {
                                '$add': [
                                    '$positive'
                                ]
                            }
                        },
                        'neutral': {
                            '$sum': {
                                '$add': [
                                    '$neutral'
                                ]
                            }
                        },
                        'negative': {
                            '$sum': {
                                '$add': [
                                    '$negative'
                                ]
                            }
                        },
                        'impressions': {
                            '$sum': {
                                '$add': [
                                    '$impressions', '$positive', '$neutral', '$negative'
                                ]
                            }
                        }
                    }
                }, {
                    '$project': {
                        'blockGroup': '$_id',
                        'positive': 1,
                        'neutral': 1,
                        'negative': 1,
                        'impressions': 1,
                    }
                }
            ];
        } else if (details.activityType === "Petition") {
            console.log(details.activityID)
            return [
                {
                    '$match': {
                        'petitionContactHistory.campaignID': details.campaignID,
                        'petitionContactHistory.orgID': details.orgID,
                        'petitionContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$petitionContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$group': {
                        '_id': '$address.blockgroupID',
                        'identified': {
                            '$sum': 1
                        }
                    }
                }
            ];
        } else if (details.activityType === "Phonebank") {
            return [
                {
                    '$match': {
                        'phonebankContactHistory.campaignID': details.campaignID,
                        'phonebankContactHistory.orgID': details.orgID,
                        'phonebankContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$phonebankContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'phonebankContactHistory.campaignID': details.campaignID,
                        'phonebankContactHistory.orgID': details.orgID,
                        'phonebankContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                }, {
                    '$addFields': {
                        'address.streetNum': {
                            '$ifNull': [
                                '$address.streetNum', 'a'
                            ]
                        },
                        'address.street': {
                            '$ifNull': [
                                '$address.street', 'a'
                            ]
                        },
                        'address.suffix': {
                            '$ifNull': [
                                '$address.suffix', 'a'
                            ]
                        },
                        'address.unit': {
                            '$ifNull': [
                                '$address.unit', 'a'
                            ]
                        },
                        'address.city': {
                            '$ifNull': [
                                '$address.city', 'a'
                            ]
                        },
                        'address.state': {
                            '$ifNull': [
                                '$address.state', 'a'
                            ]
                        },
                        'address.zip': {
                            '$ifNull': [
                                '$address.zip', 'a'
                            ]
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            '$concat': [
                                '$address.streetNum', '$address.street', '$address.suffix', '$address.unit', '$address.city', '$address.state', '$address.zip'
                            ]
                        },
                        'blockgroupID': {
                            '$first': '$address.blockgroupID'
                        },
                        'identified': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.identified', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'refused': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.refused', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'impression': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.impression', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'nonResponse': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.nonResponse', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        }
                    }
                }, {
                    '$project': {
                        '_id': '$blockgroupID',
                        'identified': {
                            '$filter': {
                                'input': '$identified',
                                'as': 'ident',
                                'cond': {
                                    '$ne': [
                                        '$$ident', null
                                    ]
                                }
                            }
                        },
                        'refused': {
                            '$filter': {
                                'input': '$refused',
                                'as': 'ref',
                                'cond': {
                                    '$ne': [
                                        '$$ref', null
                                    ]
                                }
                            }
                        },
                        'impression': {
                            '$filter': {
                                'input': '$impression',
                                'as': 'imp',
                                'cond': {
                                    '$ne': [
                                        '$$imp', null
                                    ]
                                }
                            }
                        },
                        'nonResponse': {
                            '$filter': {
                                'input': '$nonResponse',
                                'as': 'nr',
                                'cond': {
                                    '$ne': [
                                        '$$nr', null
                                    ]
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'record.identified': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$identified'
                                        }, 0
                                    ]
                                },
                                'then': '$identified',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.refused': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$refused'
                                        }, 0
                                    ]
                                },
                                'then': '$refused',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.impression': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$impression'
                                        }, 0
                                    ]
                                },
                                'then': '$impression',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.nonResponse': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$nonResponse'
                                        }, 0
                                    ]
                                },
                                'then': '$nonResponse',
                                'else': '$$REMOVE'
                            }
                        }
                    }
                }, {
                    '$project': {
                        'record': {
                            '$objectToArray': '$record'
                        }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'blockgroups': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        {
                                            '$arrayElemAt': [
                                                {
                                                    '$arrayElemAt': [
                                                        '$record.v.idHistory.idResponses', 0
                                                    ]
                                                }, 0
                                            ]
                                        }, 0
                                    ]
                                }, 0
                            ]
                        }
                    }
                }, {
                    '$project': {
                        'positive': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'POSITIVE'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'neutral': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEUTRAL'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'negative': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEGATIVE'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'impressions': {
                            '$cond': {
                                'if': {
                                    '$regexFind': {
                                        'input': "$blockgroups.responses",
                                        'regex': '(?i)left message'
                                    }
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'positive': {
                            '$sum': {
                                '$add': [
                                    '$positive'
                                ]
                            }
                        },
                        'neutral': {
                            '$sum': {
                                '$add': [
                                    '$neutral'
                                ]
                            }
                        },
                        'negative': {
                            '$sum': {
                                '$add': [
                                    '$negative'
                                ]
                            }
                        },
                        'impressions': {
                            '$sum': {
                                '$add': [
                                    '$impressions', '$positive', '$neutral', '$negative'
                                ]
                            }
                        }
                    }
                }, {
                    '$project': {
                        'blockGroup': '$_id',
                        'positive': 1,
                        'neutral': 1,
                        'negative': 1,
                        'impressions': 1,
                    }
                }
            ];
        } else if (details.activityType === "Texting") {
            return [
                {
                    '$match': {
                        'textContactHistory.campaignID': details.campaignID,
                        'textContactHistory.orgID': details.orgID,
                        'textContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$textContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'textContactHistory.campaignID': details.campaignID,
                        'textContactHistory.orgID': details.orgID,
                        'textContactHistory.activityID': details.activityID,
                        'address.blockgroupID': {
                            '$exists': true
                        }
                    }
                },/* {
                    '$match': {
                        'textContactHistory.idHistory.0.idResponses.0': {
                            '$exists': true
                        }
                    }
                },*/ {
                    '$project': {
                        '_id': '$address.blockgroupID',
                        'impression': '$textContactHistory.impression',
                        'blockgroups': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        '$textContactHistory.idHistory.idResponses', 0
                                    ]
                                }, 0
                            ]
                        }
                    }
                }, {
                    '$project': {
                        'positive': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'POSITIVE'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'neutral': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEUTRAL'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'negative': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEGATIVE'
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'impressions': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$impression', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'positive': {
                            '$sum': {
                                '$add': [
                                    '$positive'
                                ]
                            }
                        },
                        'neutral': {
                            '$sum': {
                                '$add': [
                                    '$neutral'
                                ]
                            }
                        },
                        'negative': {
                            '$sum': {
                                '$add': [
                                    '$negative'
                                ]
                            }
                        },
                        'impressions': {
                            '$sum': {
                                '$add': [
                                    '$impressions', '$positive', '$neutral', '$negative'
                                ]
                            }
                        }
                    }
                }, {
                    '$project': {
                        'blockGroup': '$_id',
                        'positive': 1,
                        'neutral': 1,
                        'negative': 1,
                        'impressions': 1
                    }
                }
            ];
        }
    })();
    var record = await People.aggregate(agg);

    return record;
}

const sendSwordOutreach = async(detail) =>{
    var tokenStr = {'headers': {'Content-Type': 'application/json', 'x-auth': 'fjkcxq3908daas43980120ahdnf2084mg048201a18nffl4'}};

    //console.log(detail.report)

    var SwordOutreachResults = await axios.post("https://swordoutreachapi.azurewebsites.net/report", detail.report, tokenStr).then(async response => {

        console.log(response)
        
        var campaign = await Campaign.findOne({campaignID: detail.campaignID})
        if (detail.activityType === "Canvass"){
            for(var i = 0; i < campaign.canvassActivities.length; i++){
                if( campaign.canvassActivities[i]._id.toString() === detail.activityID){
                    campaign.canvassActivities[i].swordRecordRawId = response.data.record
                }
            }
        }
        if (detail.activityType === "Phonebank"){
            for(var i = 0; i < campaign.phonebankActivities.length; i++){
                if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                    campaign.phonebankActivities[i].swordRecordRawId = response.data.record
                }
            }
        }
        if (detail.activityType === "Texting"){
            for(var i = 0; i < campaign.textActivities.length; i++){
                if( campaign.textActivities[i]._id.toString() === detail.activityID){
                    campaign.textActivities[i].swordRecordRawId = response.data.record
                }
            }
        }
        if (detail.activityType === "Petition"){
            for(var i = 0; i < campaign.petitionActivities.length; i++){
                if( campaign.petitionActivities[i]._id.toString() === detail.activityID){
                    campaign.petitionActivities[i].swordRecordRawId = response.data.record
                }
            }
        }
        if (detail.activityType === "Event"){
            for(var i = 0; i < campaign.eventActivities.length; i++){
                if( campaign.eventActivities[i]._id.toString() === detail.activityID){
                    campaign.eventActivities[i].swordRecordRawId = response.data.record
                }
            }
        }
        return campaign.save()

    }).catch(error => {
        console.log(error.response.data['errorList'])
        return error
    });

    return SwordOutreachResults
}




const activityTextImpressionsSwordOutreachData = async(details) => {
    console.log(details)

    const agg = [
            {
                '$match': {
                    'textContactHistory.campaignID': details.campaignID,
                    'textContactHistory.orgID': details.orgID,
                    'textContactHistory.activityID': {
                        '$in': details.activityID
                    },
                    'address.blockgroupID': {
                        '$exists': true
                    }
                }
            }, {
                '$unwind': {
                    'path': '$textContactHistory',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$match': {
                    'textContactHistory.campaignID': details.campaignID,
                    'textContactHistory.orgID': details.orgID,
                    'textContactHistory.activityID': {
                        '$in': details.activityID
                    },
                    'address.blockgroupID': {
                        '$exists': true
                    }
                }
            }, {
                '$match': {
                    'textContactHistory.idHistory.0.idResponses.0': {
                        '$exists': false
                    }
                }
            }, {
                '$project': {
                    '_id': '$address.blockgroupID',
                    'impression': '$textContactHistory.impression',
                }
            }, {
                '$project': {
                    'impressions': {
                        '$cond': {
                            'if': {
                                '$eq': [
                                    '$impression', true
                                ]
                            },
                            'then': 1,
                            'else': 0
                        }
                    }
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'impressions': {
                        '$sum': {
                            '$add': [
                                '$impressions'
                            ]
                        }
                    }
                }
            }, {
                '$project': {
                    'blockGroup': '$_id',
                    'impressions': 1
                }
            }
        ]

        console.log(agg)
    var record = await People.aggregate(agg);

    return record;

}

const sendTextImpressionsSwordOutreach = async(detail) =>{
    var tokenStr = {'headers': {'Content-Type': 'application/json', 'x-auth': 'fjkcxq3908daas43980120ahdnf2084mg048201a18nffl4'}};

    console.log("RIGHT BEFORE AXIOS")

    var SwordOutreachResults = await axios.post("https://swordoutreachapi.azurewebsites.net/report", detail.report, tokenStr).then(async response => {
        console.log(response)
        return {}

    }).catch(error => {
        console.log(error.response.data['errorList'])
        return error
    });
    console.log("RIGHT AFTER AXIOS")

    return SwordOutreachResults
}

const getEvents = async(detail) => {
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    return campaign.eventActivities;
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
        
        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                campaign.phonebankActivities.splice(i, 1); 

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

const releaseNumber = async(detail) =>{
    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    if ( detail.activityType === "Texting"){

        for(var i = 0; i < campaign.textActivities.length; i++){
            if( campaign.textActivities[i]._id.toString() === detail.activityID){

                for(var j = 0; j < campaign.textActivities[i].phoneNums.length; j++){
                    if(campaign.textActivities[i].phoneNums[j].number === detail.number){
                        campaign.textActivities[i].phoneNums.splice(j, 1); 
                        campaign.save()
                        return campaign.textActivities[i]
                    }
                }
            }
        }
    } else if (detail.activityType === "Phonebank"){

        for(var i = 0; i < campaign.phonebankActivities.length; i++){
            if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
                for(var j = 0; j < campaign.phonebankActivities[i].phoneNums.length; j++){
                    if(campaign.phonebankActivities[i].phoneNums[j].number === detail.number){
                        campaign.phonebankActivities[i].phoneNums.splice(j, 1); 
                        campaign.save()
                        return campaign.phonebankActivities[i]
                    }
                }
            }
        }
    }

    return campaign.save()

}

module.exports = {getEvents, resetActivity, createActivity, getActivities, editActivity, deleteActivity, getActivity, completeActivity, activitySwordOutreachData, activityTextImpressionsSwordOutreachData, sendSwordOutreach, sendTextImpressionsSwordOutreach, releaseNumber}
