var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
var Target = require('../models/targets/target')
var Organization = require('../models/organizations/organization'); 

var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
var ClientCapability = require('twilio').jwt.ClientCapability;

/*
const getHouseHold = async(detail) => {

    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    var searchParameters = {
                            "phones.0": {$exists: true, $ne: ""},
                            "preferredMethodContact": {$not: {$elemMatch: {method: "TEXT"}}, $not: {$elemMatch: {method: "EMAIL"}}},
                            "phonebankContactHistory.idHistory": {$not: {$elemMatch: {scriptID: "5e6ab66a2a22d2001a04a1bb"}}}
                            }

   var targetCoordinates = [];
   var hasQueries = false;

    for(var i = 0; i < targets.length; i++){
        if(targets[i]['geometry']){ 
            if(targets[i]['properties']['params']['targetType'] === "CENSUSTRACT"){
                targetCoordinates.push(targets[i]['properties']['params']['id'])
            }else{
                targetCoordinates.push(targets[i]['geometry']['coordinates'][0])
            }        
        }
        if(targets[i].properties.queries.length > 0){hasQueries = true;}
    }

    if(targetCoordinates.length > 0){
        if(targets[0]['properties']['params']['targetType'] === "CENSUSTRACT"){
            searchParameters['address.blockgroupID'] = {$in: targetCoordinates}
        }else{
            searchParameters['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
                                                                                 coordinates: targetCoordinates}}}
        }
    }

    if(hasQueries){
        var hasParties = false
        var parties = []
        for(var i = 0; i < targets.length; i++){                                   
            for(var j = 0; j < targets[i].properties.queries.length; j++){
                if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                    searchParameters['membership.orgID'] = targets[i].properties.queries[j].param
                    console.log(detail.campaignID)
                    searchParameters["phonebankContactHistory"] = {$not: {$elemMatch: {campaignID: detail.campaignID}}}
                }

                if(targets[i].properties.queries[j].queryType === "PAV"){
                    searchParameters['voterInfo.pav'] = targets[i].properties.queries[j].param
                }

                if(targets[i].properties.queries[j].queryType === "PRECINCT"){
                    searchParameters['voterInfo.precinct'] = {$regex: targets[i].properties.queries[j].param}
                }

                if(targets[i].properties.queries[j].queryType === "PROPENSITY"){
                    var low = targets[i].properties.queries[j].subParam
                    var hi = targets[i].properties.queries[j].param
                    searchParameters['voterInfo.propensity'] = { $gte :  low/100, $lte : hi/100}
                }

                if(targets[i].properties.queries[j].queryType === "PARTY"){
                    hasParties = true;
                    parties.push(targets[i].properties.queries[j].param)
                }

                if(targets[i].properties.queries[j].queryType === "SCRIPT"){

                    searchParameters['$or'] = [{$and: [{"canvassContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID}}},
                                                       {"canvassContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                       {"canvassContactHistory.refused": {$ne: true}}
                                                    
                                                    ]},
                                                       
                                               {$and: [{"petitionContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID}}},
                                                       {"petitionContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                       {"petitionContactHistory.refused": {$ne: true}}
                                                    
                                                    ]},

                                               ]

                    searchParameters["phonebankContactHistory"] = {$not: {$elemMatch: {campaignID: detail.campaignID}}}
                }
            }                                                             
        }

        if(hasParties){
            searchParameters['voterInfo.party'] = {$in: parties}
        }
    }else{
        searchParameters["phonebankContactHistory"] = {$not: {$elemMatch: {campaignID: detail.campaignID}}}
        searchParameters['creationInfo.regType'] = "VOTERFILE"
    }

    console.log(searchParameters)

    var houseHold = await Person.aggregate([ 
        {$match: searchParameters},
        {$limit: 3},
        {$group : { _id : {streetNum: "$address.streetNum",
                           suffix: "$address.suffix",
                           prefix:  "$address.prefix",
                           city: "$address.city",
                           state: "$address.state",
                           county: "$address.county",
                           zip: "$address.zip",
                           unit: "$address.unit",
                           street: "$address.street"}, 
                    people: { $push: {firstName: '$firstName',
                                      middleName: '$middleName',
                                      lastName: '$lastName', 
                                      phones: '$phones',
                                      emails: '$emails',
                                      address: '$address',
                                      phonebankContactHistory: '$phonebankContactHistory',
                                      canvassContactHistory: '$canvassContactHistory',
                                      petitionContactHistory: '$petitionContactHistory',
                                      voterInfo: '$voterInfo',
                                      _id: "$_id"}}}},{$sample: { size: 10 } }
        ]).allowDiskUse(true).limit(1)


    try { 
        if( houseHold.length > 0){
            return {houseHold: houseHold[0], total: 0} 
        }else{
        
            return {houseHold: [], total: 0} 

        }

    } catch(e){
        throw new Error(e.message)
    } 
}
*/
const lockHouseHold = async(detail)=>{

    var searchParameters = {
                            "phones.0": {$exists: true, $ne: ""},
                            "preferredMethodContact": {$not: {$elemMatch: {method: "TEXT"}}, $not: {$elemMatch: {method: "EMAIL"}}},
                            "phonebankContactHistory.idHistory": {$not: {$elemMatch: {scriptID: "5e6ab66a2a22d2001a04a1bb"}}},
                            "address.blockgroupID": {$exists: true},
                            "phonebankContactHistory" : {$not: {$elemMatch: {activityID: detail.activityID}}}
                            }

    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})

    var targetCoordinates = [];
    var hasQueries = false;

    for(var i = 0; i < targets.length; i++){
        if(targets[i]['geometry']){ 
            if(targets[i]['properties']['params']['targetType'] === "CENSUSTRACT"){
                targetCoordinates.push(targets[i]['properties']['params']['id'])
            }else{
                targetCoordinates.push(targets[i]['geometry']['coordinates'][0])
            }        
        }
        if(targets[i].properties.queries.length > 0){hasQueries = true;}
    }

    if(targetCoordinates.length > 0){
        if(targets[0]['properties']['params']['targetType'] === "CENSUSTRACT"){
            searchParameters['address.blockgroupID'] = {$in: targetCoordinates}
        }else{
            searchParameters['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
                                                                                 coordinates: targetCoordinates}}}
        }
    }

    if(hasQueries){
        for(var i = 0; i < targets.length; i++){                                   
            for(var j = 0; j < targets[i].properties.queries.length; j++){
                if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                    searchParameters['membership.orgID'] = targets[i].properties.queries[j].param
                    //console.log(detail.campaignID)
                    searchParameters["phonebankContactHistory"] = {$not: {$elemMatch: {campaignID: detail.campaignID}}}
                }

                if(targets[i].properties.queries[j].queryType === "SCRIPT"){

                    console.log(targets[i].properties.queries[j])

                    searchParameters['$or'] = [{$and: [{"canvassContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID}}},
                                                       {"canvassContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                       {"canvassContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                                       {"canvassContactHistory.refused": {$ne: true}}
                                                    
                                                    ]},
                                                       
                                               {$and: [{"petitionContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID}}},
                                                       {"petitionContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                       {"petitionContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                                       {"petitionContactHistory.refused": {$ne: true}}
                                                    
                                                    ]},
                                                {$and: [{"phonebankContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID}}},
                                                       {"phonebankContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                       {"phonebankContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                                       {"phonebankContactHistory.refused": {$ne: true}}
                                                    
                                                    ]},
                                               ]
                }
            }                                                             
        }

    }else{
        searchParameters['creationInfo.regType'] = "VOTERFILE"
    }

    var phonebankContactHistory = {
        campaignID: detail.campaignID,
        activityID: detail.activityID,
        lockedBy: detail.userID,
        orgID: detail.orgID
      }

    var houseHoldToUpdate = await Person.aggregate([ 
        {$match: searchParameters},
        {$limit: 3},
        {$group : { _id : {streetNum: "$address.streetNum",
                           suffix: "$address.suffix",
                           prefix:  "$address.prefix",
                           city: "$address.city",
                           state: "$address.state",
                           county: "$address.county",
                           zip: "$address.zip",
                           unit: "$address.unit",
                           street: "$address.street"}, 
                    people: { $push: {_id: "$_id"}}}},{$sample: { size: 10 } }
        ]).allowDiskUse(true).limit(1)

    if(houseHoldToUpdate.length > 0){
        for(var i = 0; i < houseHoldToUpdate[0].people.length; i++){
            var person = await Person.findOne({_id: houseHoldToUpdate[0].people[i]._id})
            person.phonebankContactHistory.push(phonebankContactHistory)
            person.save()
        }
    
        return {status: true}

    }else{
        return {status: false}
    }
}


const getLockedHouseHold = async(detail)=>{

    try { 
        searchParameters = {"phonebankContactHistory" : {$elemMatch: {campaignID: detail.campaignID, activityID: detail.activityID, lockedBy: detail.userID, houseHoldComplete: false}}}

        var houseHold = await Person.aggregate([ 
            {$match: searchParameters},
            {$group : { _id : {streetNum: "$address.streetNum",
                               suffix: "$address.suffix",
                               prefix:  "$address.prefix",
                               city: "$address.city",
                               state: "$address.state",
                               county: "$address.county",
                               zip: "$address.zip",
                               unit: "$address.unit",
                               street: "$address.street"}, 
                        people: { $push: {firstName: '$firstName',
                                          middleName: '$middleName',
                                          lastName: '$lastName', 
                                          phones: '$phones',
                                          emails: '$emails',
                                          address: '$address',
                                          phonebankContactHistory: '$phonebankContactHistory',
                                          canvassContactHistory: '$canvassContactHistory',
                                          petitionContactHistory: '$petitionContactHistory',
                                          voterInfo: '$voterInfo',
                                          _id: "$_id"}}}},{$sample: { size: 10 } }
            ]).allowDiskUse(true).limit(1)
        
        console.log(houseHold)
        if( houseHold.length > 0){
            return houseHold[0].people
        }else{
            return houseHold
        }

    } catch(e){
        throw new Error(e.message)
    } 

}


const getTwilioToken = async(detail) =>{

    var org = await Organization.findOne({"_id": detail.orgID})

    var capability = new ClientCapability({
        accountSid: org.twilioAccount.sid,
        authToken: org.twilioAccount.authToken
      });
    
    capability.addScope(new ClientCapability.OutgoingClientScope({applicationSid: org.twilioAccount.app_sid}));
    
    var token = capability.toJwt();

    return {token: token}
}

const call = async(detail) =>{
    console.log("Calling...");
    
    var number = detail.number;
    var twiml = new VoiceResponse();
    var dial = twiml.dial({callerId : detail.origin});
    dial.number(number);

    return twiml.toString();
}

const editPerson = async(detail) =>{
    var person = await Person.findOne({_id: detail.person._id})
    person.firstName = detail.newDetail.firstName;
    person.middleName = detail.newDetail.middleName;
    person.lastName = detail.newDetail.lastName
    person.phones = detail.newDetail.phone;
    person.emails = detail.newDetail.email;
    return person.save()
}

const createPerson = async(detail)=>{
    var person = new Person(detail.newPerson);
    return person.save()
}

const idPerson = async(detail)=>{
    var houseHoldCompleted = []

    for(var i = 0; i < detail.houseHold.length; i++){
        if(detail.houseHold[i]._id === detail.person._id){
            var person = await Person.findOne({"_id": detail.houseHold[i]._id});
            for (var j = 0; j < person.phonebankContactHistory.length; j++){
                if(person.phonebankContactHistory[j].activityID === detail.activityID){
                    person.phonebankContactHistory[j].idHistory = detail.idHistory
                    person.phonebankContactHistory[j].identified = true;
                    person.phonebankContactHistory[j].nonResponse = false;
                    person.phonebankContactHistory[j].refused = false;
                    person.phonebankContactHistory[j].houseHoldComplete = true;
                    person.save()
                    houseHoldCompleted.push(person)
                }
            }
        }else{
            var person = await Person.findOne({"_id": detail.houseHold[i]._id});
            for (var j = 0; j < person.phonebankContactHistory.length; j++){
                if(person.phonebankContactHistory[j].activityID === detail.activityID){
                    person.phonebankContactHistory[j].houseHoldComplete = true;
                    person.save()
                    houseHoldCompleted.push(person)
                }
            }
        } 
    }

    return houseHoldCompleted
}

const nonResponse = async(detail)=>{

    var houseHoldCompleted = []
    var refused = false;
    var impression = false;

    if(detail.idType === 'REFUSED'){
        refused = true;
    }

    if(detail.idHistory[0].idResponses[0].responses === "Left Message"){
        impression = true;
    }

    for(var i = 0; i < detail.houseHold.length; i++){

        var person = await Person.findOne({"_id": detail.houseHold[i]._id});
        for (var j = 0; j < person.phonebankContactHistory.length; j++){
            if(person.phonebankContactHistory[j].activityID === detail.activityID){
                person.phonebankContactHistory[j].idHistory = detail.idHistory
                person.phonebankContactHistory[j].houseHoldComplete = true;
                person.phonebankContactHistory[j].identified = false;
                person.phonebankContactHistory[j].nonResponse = true;
                person.phonebankContactHistory[j].refused = refused;
                person.phonebankContactHistory[j].impression = impression;
                person.save()
                houseHoldCompleted.push(person)
            }
        }
         
    }

    return houseHoldCompleted

}

const completeHouseHold = async(detail)=>{
    var person = await Person.findOne({"_id": detail.person._id});

    if(detail.activityType === "Phonebank"){
        for(var i = 0; i < person.phonebankContactHistory.length; i++){
            if(person.phonebankContactHistory[i].activityID === detail.activityID){
                person.phonebankContactHistory[i].houseHoldComplete = true;
                return person.save()
            }
        }
    } 
}

const allocatePhoneNumber = async(detail) =>{

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    for(var i = 0; i < campaign.phonebankActivities.length; i++){
        if( campaign.phonebankActivities[i]._id.toString() === detail.activityID){
            for(var j = 0; campaign.phonebankActivities[i].phoneNums.length; j++){
                if(campaign.phonebankActivities[i].phoneNums[j].number === detail.phoneNumber.number){
                    campaign.phonebankActivities[i].phoneNums[j].available = false
                    campaign.phonebankActivities[i].phoneNums[j].userID = detail.userID
                    return campaign.save()
                }
            }
        }
    }
}

const getNumCompleted = async(detail) =>{
    //var completed = await Person.count({"phonebankContactHistory.idHistory.idBy": detail.userID})
    return {completed: 0}
}

module.exports = {getNumCompleted, lockHouseHold, getLockedHouseHold,
                  call, 
                  getTwilioToken, 
                  editPerson, 
                  createPerson, 
                  idPerson, 
                  nonResponse, 
                  allocatePhoneNumber, 
                  completeHouseHold}


