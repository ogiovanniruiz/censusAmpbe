var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
var Target = require('../models/targets/target')
var Organization = require('../models/organizations/organization'); 

var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
var ClientCapability = require('twilio').jwt.ClientCapability;

const getHouseHold = async(detail) => {

    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    //var searchParameters = {"phonebankContactHistory": {$not:{ $elemMatch: {activityID: detail.activityID, identified: true}}}}
    //var searchParameters = {"phonebankContactHistory": {$not:{ $elemMatch: {activityID: detail.activityID, houseHoldComplete: true}}}}

    var searchParameters = {"phones": {$not: {$size: 0}},
    /*
                $or:[{"phonebankContactHistory": {$elemMatch: {campaignID: detail.campaignID, reserved: detail.userID}},},
                     {"phonebankContactHistory": {$elemMatch: {campaignID: detail.campaignID, reserved: {$exists: false}}}}],
    */
            $or:[{"phonebankContactHistory": {$elemMatch: {campaignID: detail.campaignID, houseHoldComplete: false}}},
                 {"phonebankContactHistory": {$exists: false}},
                 {"phonebankContactHistory": {$size: 0}}
                ]}

   var targetCoordinates = []

   var hasQueries = false;

    for(var i = 0; i < targets.length; i++){
        if(targets[i]['geometry']){ targetCoordinates.push(targets[i]['geometry']['coordinates'][0])}
        if(targets[i].properties.queries.length > 0){hasQueries  = true;}
    }

    if(targetCoordinates.length > 0){
        searchParameters['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
                                                                            coordinates: targetCoordinates}}}
    }

    if(hasQueries){
        for(var i = 0; i < targets.length; i++){                                   
            for(var j = 0; j < targets[i].properties.queries.length; j++){
                if(targets[i].properties.queries[j].queryType === "PAV"){
                    searchParameters['voterInfo.pav'] = targets[i].properties.queries[j].param
                }

                if(targets[i].properties.queries[j].queryType === "PRECINCT"){
                    searchParameters['voterInfo.precinct'] = {$regex: targets[i].properties.queries[j].param}
                }

                if(targets[i].properties.queries[j].queryType === "PROPENSITY"){
                    var low = targets[i].properties.queries[j].subParam
                    var hi = targets[i].properties.queries[j].param
                    searchParameters['voterInfo.propensity'] = { $gt :  low/100, $lt : hi/100}
                }
            }                                                             
        }
    }

    console.log(searchParameters)

    var people = await Person.aggregate([ 
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
                                      voterInfo: '$voterInfo',
                                      _id: "$_id"}}}},{$sample: { size: 10 } }
        ]).allowDiskUse(true).limit(1)

    /*
    if(people[0]){
        if(people[0].people){
            for(var i = 0; i < people[0].people.length; i++){
                var person = await Person.findOne({"_id": people[0].people[i]._id})
                for(var j = 0; j < person.phonebankContactHistory.length; j++){
                    if(person.phonebankContactHistory[j].campaignID === detail.campaignID){
                        person.phonebankContactHistory[j].reserved = detail.userID;
                        person.save()
                        break
    
                    }
                }
            }
        }
    }*/



    
    try { return people[0] 
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

    var person = await Person.findOne({"_id": detail.person._id});

    var idHistory = {scriptID: detail.script._id,
                     idBy: detail.userID,
                     idResponses: detail.idResponses,
                     locationIdentified: detail.location}

    if(person.phonebankContactHistory.length === 0){

        var phonebankContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        identified: true,
                                        idHistory: idHistory
                                    }

        person.phonebankContactHistory.push(phonebankContactHistory)
        return person.save()

    }else{
        for (var i = 0; i < person.phonebankContactHistory.length; i++){
            if(person.phonebankContactHistory[i].activityID === detail.activityID){
                person.phonebankContactHistory[i].idHistory.push(idHistory)
                person.phonebankContactHistory[i].identified = true;
                person.phonebankContactHistory[i].nonResponse = false;
                person.phonebankContactHistory[i].refused = false;
                return person.save()
            }
        }

        var phonebankContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        identified: true,
                                        idHistory: idHistory
                                    }

        person.phonebankContactHistory.push(phonebankContactHistory)
        return person.save()
    }
}

const nonResponse = async(detail)=>{
    var person = await Person.findOne({"_id": detail.person._id});
    var refused = false;


    if(detail.idType === 'REFUSED'){
        refused = true;
    }

    var idHistory = {scriptID: detail.script._id,
        idBy: detail.userID,
        idResponses: detail.idResponses,
        locationIdentified: detail.location}

    if(person.phonebankContactHistory.length === 0){

        var phonebankContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        refused: refused,
                                        nonResponse: true,
                                        identified: false,
                                        idHistory: idHistory
                                    }

        person.phonebankContactHistory.push(phonebankContactHistory)
        return person.save()
    
    }else{
    
        for (var i = 0; i < person.phonebankContactHistory.length; i++){
            if(person.phonebankContactHistory[i].activityID === detail.activityID){
                person.phonebankContactHistory[i].idHistory.push(idHistory)
                person.phonebankContactHistory[i].identified = false;
                person.phonebankContactHistory[i].nonResponse = true;
                person.phonebankContactHistory[i].refused = refused;
                return person.save()
            }
        }

        var phonebankContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        refused: refused,
                                        nonResponse: true,
                                        identified: false,
                                        idHistory: idHistory
                                    }
    
        person.phonebankContactHistory.push(phonebankContactHistory)
        return person.save()
    }
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

module.exports = {getHouseHold, 
                  call, 
                  getTwilioToken, 
                  editPerson, 
                  createPerson, 
                  idPerson, 
                  nonResponse, 
                  allocatePhoneNumber, 
                  completeHouseHold}


                                  /*
                if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                    searchParameters['membership.orgID'] = targets[i].properties.queries[j].param
                }
                if(targets[i].properties.queries[j].queryType === "SCRIPT"){
                }

                if(targets[i].properties.queries[j].queryType === "TAGS"){
                }*/