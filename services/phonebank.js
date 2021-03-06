var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
var Target = require('../models/targets/target')
var Organization = require('../models/organizations/organization'); 

var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
var ClientCapability = require('twilio').jwt.ClientCapability;

const lockHouseHold = async(detail)=>{

    //var campaign = await Campaign.findOne({campaignID: detail.campaignID})
    //console.log('Consumer: ', campaign.thirdParty)

    var searchParameters = {
                            "phones.0": {$exists: true, $ne: ""},
                            "preferredMethodContact": {$not: {$elemMatch: {method: "TEXT", method: "EMAIL"}}},
                            "address.blockgroupID": {$exists: true},
                            "phonebankContactHistory" : {$not: {$elemMatch: {activityID: detail.activityID}}},
                            "phonebankContactHistory.refused": {$ne: true},
                            "textContactHistory.refused": {$ne: true},
                            
                            $nor: [{"phonebankContactHistory.idHistory.idResponses.responses": "Wrong Number"},
                                   {"phonebankContactHistory.idHistory.idResponses.responses": "wrong number"},
                                   {"phonebankContactHistory.idHistory.idResponses.responses": "Bad Number"},
                                   {"phonebankContactHistory.idHistory.idResponses.responses": "Disconnected"},
                                   {"phonebankContactHistory.idHistory.idResponses.responses": "Deceased"},
                                   {"phonebankContactHistory.idHistory.idResponses.responses": "Moved"},
                                   {"phonebankContactHistory.idHistory.idResponses.responses": "Already completed census form"}
                                    ]
                            }
    //if(campaign.thirdParty){
    //searchParameters['consumerData.consumer'] = true
    //}

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
            
            var cityArray = []
            var blockgroupArray = []
            for(var j = 0; j < targets[i].properties.queries.length; j++){

                if(targets[i].properties.queries[j].queryType === 'prevID'){
                    searchParameters['identified'] = {$exists: true}
                    searchParameters['identified.identified'] = true

                    searchParameters['identified.finished'] = false
                    searchParameters['identified.locked'] = false
                }

                if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                    searchParameters['membership.orgID'] = targets[i].properties.queries[j].param
                }

                if(targets[i].properties.queries[j].queryType === "SCRIPT"){

                    if(targets[i].properties.queries[j].subParam === "NONRESPONSE"){
                    
                        searchParameters['$and'] = [
                        
                                        {"phonebankContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID, campaignID: targets[i].properties.campaignID}}},
                                        {"phonebankContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                        {"phonebankContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                        {"phonebankContactHistory.refused": {$ne: true}},
                                       {"phonebankContactHistory.identified": {$ne: true}}
                         
                                            ]
                            
                    }else if(targets[i].properties.queries[j].subParam === "POSITIVE"){
                        searchParameters['$or'] = [{$and: [{"canvassContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID, campaignID: targets[i].properties.campaignID}}},
                                                            {"canvassContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                            {"canvassContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                                            {"canvassContactHistory.refused": {$ne: true}}
                                                            ]},
                        
                                                   {$and: [{"petitionContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID, campaignID: targets[i].properties.campaignID}}},
                                                           {"petitionContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                           {"petitionContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                                           {"petitionContactHistory.refused": {$ne: true}}                                  
                                                          ]},

                                                    {$and: [{"phonebankContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID, campaignID: targets[i].properties.campaignID}}},
                                                            {"phonebankContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                                                            {"phonebankContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                                                            {"phonebankContactHistory.refused": {$ne: true}}
                                                           ]}]

                    }
 
                }

                var hasCities = false;

                if(targets[i].properties.queries[j].queryType === "CITY"){
                    hasCities = true;
                    cityArray.push(targets[i].properties.queries[j].param)
                }

                if( hasCities){
                    searchParameters["address.city"] = {$in: cityArray}
                }

               
                var hasBlockgroups = false;

                if(targets[i].properties.queries[j].queryType === "BLOCKGROUP"){
                    hasBlockgroups = true;
                    blockgroupArray.push(targets[i].properties.queries[j].param)
                }

                if( hasBlockgroups){
                    searchParameters["address.blockgroupID"] = {$in: blockgroupArray}
                }

            }                                                             
        }

    }else{
        searchParameters['creationInfo.regType'] = "VOTERFILE"
    }


    //console.debug(JSON.stringify(searchParameters))

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

        var scriptArray = ["5e6ab66a2a22d2001a04a1bb","5e7e8f2846de27001ac2beba", "5e6fca54ae6cdf001901b7c1"]
        for(var i = 0; i < houseHoldToUpdate[0].people.length; i++){
            var person = await Person.findOne({_id: houseHoldToUpdate[0].people[i]._id})
            var duplicationError = false;
            for(var j = 0; j < person.phonebankContactHistory.length; j++){
                if(person.phonebankContactHistory[j].activityID === detail.activityID){
                    duplicationError = true;
                    //console.log("1")
                }

                if(person.phonebankContactHistory[j].refused){
                    duplicationError = true;
                   // console.log("2")
                }

                for(var k = 0; k < person.phonebankContactHistory[j].idHistory.length; k++){
                    if(scriptArray.includes(person.phonebankContactHistory[j].idHistory[k].scriptID)){

                        if(person.phonebankContactHistory[j].idHistory[k].idResponses){
                            if(person.phonebankContactHistory[j].idHistory[k].idResponses[0]){
                                if(person.phonebankContactHistory[j].idHistory[k].idResponses[0].idType === "POSITIVE"){
                                    duplicationError = true;
                                    //console.log("3")
                                }
                            }
                        }
                    }
                } 
            }
            
          /*
            for(var j = 0; j < person.textContactHistory.length; j++){
                for(var k = 0; k < person.textContactHistory[j].idHistory.length; k++){
                    if(scriptArray.includes(person.textContactHistory[j].idHistory[k].scriptID)){
                        if(person.textContactHistory[j].idHistory[k].idResponses[0].idType === "POSITIVE"){
                            duplicationError = true;
                        }
                    }
                } 
            }
*/
            if(!duplicationError){
                person.phonebankContactHistory.push(phonebankContactHistory)
                person.identified.locked = true;
                person.save()
                //console.log(person)
            }else{
                
                var completedphonebankContactHistory = {
                    campaignID: detail.campaignID,
                    activityID: detail.activityID,
                    lockedBy: detail.userID,
                    orgID: detail.orgID,
                    houseHoldComplete: true,
                  }
                person.phonebankContactHistory.push(completedphonebankContactHistory)
                person.identified.locked = true;
                person.save()
               // console.log(person)

            }
        }
    
        return {status: true}

    }else{
        console.log("NOTHING AVAILABLE")
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
                                          identified: '$identified',
                                          voterInfo: '$voterInfo',
                                          _id: "$_id"}}}},{$sample: { size: 10 } }
            ]).allowDiskUse(true).limit(1)
        
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



const idPerson = async(detail)=>{
    var houseHoldCompleted = []

    var updateSuccess = false;

    for(var i = 0; i < detail.houseHold.length; i++){
        if(detail.houseHold[i]._id === detail.person._id){
            var person = await Person.findOne({"_id": detail.houseHold[i]._id});
            for (var j = 0; j < person.phonebankContactHistory.length; j++){
                if(person.phonebankContactHistory[j].activityID === detail.activityID){
                    person.phonebankContactHistory[j].idHistory = detail.idHistory;
                    person.phonebankContactHistory[j].identified = true;
                    person.phonebankContactHistory[j].nonResponse = false;
                    person.phonebankContactHistory[j].refused = false;
                    person.phonebankContactHistory[j].houseHoldComplete = true;
                    //person.phonebankContactHistory[j].impression = true;
                    
                    updateSuccess = true
                }
            }
            //console.log(person)

            person['identified'].finished = true;

            person.save()
            houseHoldCompleted.push(person)
        }else{
            var person = await Person.findOne({"_id": detail.houseHold[i]._id});
            for (var j = 0; j < person.phonebankContactHistory.length; j++){
                if(person.phonebankContactHistory[j].activityID === detail.activityID){
                    person.phonebankContactHistory[j].houseHoldComplete = true;

                }
            }

            person.save()
            houseHoldCompleted.push(person)
        } 
    }

    if(updateSuccess){
        return {houseHoldCompleted: houseHoldCompleted, status: true}

    }else{
        return {houseHoldCompleted: houseHoldCompleted, status: false}

    }

    
}

const nonResponse = async(detail)=>{

    var houseHoldCompleted = []
    var updateSuccess = false;
    var refused = false;
    var impression = false;

    if(detail.idType === 'REFUSED'){
        refused = true;
    }

    if(detail.idHistory[0].idResponses[0].responses === "Left Message"){
        impression = true;
    }
    if(detail.idHistory[0].idResponses[0].responses === "Message"){
        impression = true;
    }
    if(detail.idHistory[0].idResponses[0].responses === "MESSAGE"){
        impression = true;
    }
    if(detail.idHistory[0].idResponses[0].responses === "LEFT MESSAGE"){
        impression = true;
    }

    var index = detail.idHistory[0].idResponses[0].responses.indexOf("Message")

    if(index !== -1){
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
                var updateSuccess = true;

            }
        }

        person['identified'].finished = true;

        person.save()
        houseHoldCompleted.push(person)
    }

    if(updateSuccess){
        return {houseHoldCompleted: houseHoldCompleted, status: true}

    }else{
        return {houseHoldCompleted: houseHoldCompleted, status: false}

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

module.exports = {
                    lockHouseHold, 
                    getLockedHouseHold,
                    call, 
                    getTwilioToken,  
                    idPerson, 
                    nonResponse, 
                    allocatePhoneNumber
                 }