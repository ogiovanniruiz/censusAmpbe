var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
var Target = require('../models/targets/target')
var Organization = require('../models/organizations/organization'); 

const resetTextBank = async(detail) =>{

    var people = await Person.find({"textContactHistory": { $elemMatch: {activityID: detail.activityID}}});
    var count = 0;
    
    for(var i = 0; i <  people.length; i++){
        people[i].textable = '?'

        for(var j = 0; j < people[i].textContactHistory.length; j++){
            if(people[i].textContactHistory[j].activityID === detail.activityID){
                people[i].textContactHistory.splice(j,1)
                people[i].save()
            }
        }
    }

    return {count: count}
}

const lockNewPeople = async(detail) =>{
    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})

    var searchParameters = {$or: [{"textContactHistory": {$size: 0}}, 
                                  {"textContactHistory": {$not: {$elemMatch: {activityID : detail.activityID}}}}
                                 ],
                                 
                                 "preferredMethodContact": {$not: {$elemMatch: {method: "PHONE"}}, $not: {$elemMatch: {method: "EMAIL"}}},
                                 "phones.0": {$exists: true, $ne: ""},
                                 "textable": {$ne: "FALSE"}
                                 
                            }

    
    var targetCoordinates = []
    var hasQueries = false;
 
     for(var i = 0; i < targets.length; i++){
         //if(targets[i]['geometry']){ targetCoordinates.push(targets[i]['geometry']['coordinates'][0])}
        // if(targets[i].properties.queries.length > 0){hasQueries  = true;}

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
         //searchParameters['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
         //coordinates: targetCoordinates}}}
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
                                                        {"canvassContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}}]},
                                               {$and: [{"petitionContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID}}},
                                                       {"petitionContactHistory.identified": true}]}
                                               ]
                }
            }                                                             
        }

        if(hasParties){
            searchParameters['voterInfo.party'] = {$in: parties}
        }
     }else{
        searchParameters['creationInfo.regType'] = "VOTERFILE"
    }

    console.log(searchParameters)

    var people = await Person.find(searchParameters).limit(5); 
    
    var textContactHistory = { 
                               campaignID: detail.campaignID,
                               activityID: detail.activityID,
                               lockedBy: detail.userID,
                               orgID: detail.orgID
                             }

    for(var i = 0; i < people.length; i++){
        people[i].textContactHistory.push(textContactHistory)
        people[i].save()
    }  
    return {msg: "processing"}
}

const allocatePhoneNumber = async(detail) =>{

    var campaign = await Campaign.findOne({campaignID: detail.campaignID})

    for(var i = 0; i < campaign.textActivities.length; i++){
        if( campaign.textActivities[i]._id.toString() === detail.activityID){
            for(var j = 0; campaign.textActivities[i].phoneNums.length; j++){
                if(campaign.textActivities[i].phoneNums[j].number === detail.phoneNumber.number){
                    campaign.textActivities[i].phoneNums[j].available = false
                    campaign.textActivities[i].phoneNums[j].userID = detail.userID
                    return campaign.save()
                }
            }
        }
    }
}

/*
const getTextMetaData = async(detail) =>{

    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    var searchParametersTotal = {"phones": { $exists: true, $not: {$size: 0}}}
/*
    for(var i = 0; i < targets.length; i++){
        if(targets[i].properties.params.targetType === "ORGMEMBERS"){
            searchParametersTotal['membership.orgID'] = targets[i].properties.params.id
        
        }else if (targets[i].properties.params.targetType === "SCRIPT"){

            searchParametersTotal['$or'] = [{'phonebankContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                                 idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}}, 
                                            {'canvassContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                               idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}},
                                            {'textContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                            idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}}]
        }
    }

    var targetCoordinates = []

    var hasQueries = false;
 
     for(var i = 0; i < targets.length; i++){
         if(targets[i]['geometry']){ targetCoordinates.push(targets[i]['geometry']['coordinates'][0])}
         if(targets[i].properties.queries.length > 0){hasQueries  = true;}
     }
 
     if(targetCoordinates.length > 0){
        searchParametersTotal['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
         coordinates: targetCoordinates}}}
     }
 
     if(hasQueries){
         for(var i = 0; i < targets.length; i++){                                   
             for(var j = 0; j < targets[i].properties.queries.length; j++){
                 if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                    searchParametersTotal['membership.orgID'] = targets[i].properties.queries[j].param
                 }
                 if(targets[i].properties.queries[j].queryType === "SCRIPT"){
 
                 }
 
                 if(targets[i].properties.queries[j].queryType === "TAGS"){
 
                 }
             }                                                             
         }
     }

    var totalPeople = await Person.find(searchParametersTotal).count();

    const searchParametersSent = searchParametersTotal
    const searchParametersResponded = searchParametersTotal
    const searchParametersIdentified = searchParametersTotal
    const searchParametersPositive = searchParametersTotal
    const searchParametersNeutral = searchParametersTotal
    const searchParametersNegative = searchParametersTotal
    const searchParametersRefused = searchParametersTotal

    searchParametersSent["textContactHistory"] =  {$elemMatch: {textSent : true, activityID : detail.activityID}}
    var textsSent = await Person.find(searchParametersSent).count()

    searchParametersResponded["textContactHistory"] = {$elemMatch: {textReceived : true, activityID : detail.activityID}}
    var textsResponded = await Person.find(searchParametersResponded).count()

    searchParametersIdentified["textContactHistory"] = {$elemMatch: {identified : true, activityID : detail.activityID}}
    var identified = await Person.find(searchParametersIdentified).count()

    searchParametersPositive['textContactHistory']= {$elemMatch: {activityID : detail.activityID,
                                                                 "idHistory": {$elemMatch: {idResponses: {$elemMatch: {idType: "POSITIVE"}}}}}}
    var positives = await Person.find(searchParametersPositive).count()

    searchParametersNegative['textContactHistory']= {$elemMatch: {activityID : detail.activityID,
                                                                 "idHistory": {$elemMatch: {idResponses: {$elemMatch: {idType: "NEGATIVE"}}}}}}
    var negatives = await Person.find(searchParametersNegative).count()
    
    searchParametersNeutral['textContactHistory']= {$elemMatch: {activityID : detail.activityID,
                                                                  "idHistory": {$elemMatch: {idResponses: {$elemMatch: {idType: "NEUTRAL"}}}}}}
    var neutrals = await Person.find(searchParametersNeutral).count()

    searchParametersRefused['textContactHistory']= {$elemMatch: {activityID : detail.activityID,
                                                                  "idHistory": {$elemMatch: {idResponses: {$elemMatch: {idType: "REFUSED"}}}}}}
    var refused = await Person.find(searchParametersRefused).count()


    return {total: totalPeople, 
            textsSent: textsSent, 
            textsResponded: textsResponded, 
            identified: identified, 
            positives: positives,
            neutrals: neutrals,
            negatives: negatives,
            refused: refused}

}
*/

const loadLockedPeople = async(detail) =>{

    var people = await Person.find({"textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textSent: false }}}).limit(10); 
    return people
}

const getRespondedPeople = async(detail) =>{

    //var completePeople = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textReceived: true, complete: false }}}).limit(5);   
    var people = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textReceived: true, complete: false }}});
    var peopleNames = people.map(x => {return {_id: x._id, firstName: x.firstName, lastName: x.lastName, textContactHistory: x.textContactHistory, phones: x.phones}})
    return peopleNames
}

const getConversation = async(detail) =>{
    var person = await Person.findOne({_id: detail._id})
    return person
}

const getIdentifiedPeople = async(detail) =>{
    var people = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, textReceived: true, complete: true }}});
    var peopleNames = people.map(x => {return {_id: x._id, firstName: x.firstName, lastName: x.lastName, textContactHistory: x.textContactHistory, phones: x.phones}})
    //var identified = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, identified: true }}})   
    return peopleNames
}

const sendText = async(detail) =>{

    var org = await Organization.findOne({"_id": detail.orgID})

    var number = detail.person.phones[0]
    var script = detail.initTextMsg

    var accountSid = org.twilioAccount.sid;
    var authToken = org.twilioAccount.authToken;

    const client = require('twilio')(accountSid, authToken);

    try {
        var person = await Person.findOne({_id: detail.person._id})

        if(person.textable === '?'){
            var data = await client.lookups.phoneNumbers('+1' + number)
            .fetch({type: ['carrier']})
            .then(phone_number => {return (phone_number.carrier)});
      
            if(data.type != 'mobile'){
                person.textable = 'FALSE'

                for (var i = 0; i < person.textContactHistory.length; i++) {
                    if(person.textContactHistory[i].activityID === detail.activityID){
                        person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: "FAILED", error: "NOTMOBILE"})
                        person.textContactHistory[i].textSent = true
                    }
                }
                return person.save()
            }

            person.textable = 'TRUE'

         

        }else if (person.textable === 'FALSE'){
            for (var i = 0; i < person.textContactHistory.length; i++) {
                if(person.textContactHistory[i].activityID === detail.activityID){
                    person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: "FAILED", error: "NOTMOBILE"})
                    person.textContactHistory[i].textSent = true
                }
            }
            return person.save()
        }

        var returnedData = await client.messages.create({
            body: script, 
            from: detail.phoneNum,
            to: '+1' + number,
        }).then(message => {
            console.log("Success", message)
            
            for(var i = 0; i < person.textContactHistory.length; i++){
                if(person.textContactHistory[i].activityID === detail.activityID){
                    person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: detail.initTextMsg})
                    person.textContactHistory[i].outgoingPhoneNum = detail.phoneNum
                    person.textContactHistory[i].textSent = true
                    person.textContactHistory[i].impression = true
                }
            }
    
            return person.save()
        }).catch(e => { 
            for (var i = 0; i < person.textContactHistory.length; i++) {
                if(person.textContactHistory[i].activityID === detail.activityID){
                    person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: e.message, error: e.message})
                    person.textContactHistory[i].textSent = true
                }
            }
            return person.save()
        });
        return returnedData

    } catch (error){
        console.log(error)
    }
}

const receiveTexts = async(incoming) =>{

    var phoneNumber = incoming.From.substring(2);
    var message = incoming.Body;
    var outgoingPhoneNum = incoming.To;

    try{

        var activeActivityID = ""

        var campaigns = await Campaign.find()

        for(var k = 0; k < campaigns.length; k++){
            for(var i = 0; i < campaigns[k].textActivities.length; i++){
                for(var j = 0; j < campaigns[k].textActivities[i].phoneNums.length; j++){
                    if(campaigns[k].textActivities[i].phoneNums[j]){
                        if(campaigns[k].textActivities[i].phoneNums[j].number === outgoingPhoneNum && campaigns[k].textActivities[i].activityMetaData.active){
                            activeActivityID = campaigns[k].textActivities[i]._id 
                        }
                    }
                }  
            } 
        }

        var person = await Person.findOne({"phones": phoneNumber});  
        for(var i = 0; i < person.textContactHistory.length; i++){

            if(person.textContactHistory[i].outgoingPhoneNum === outgoingPhoneNum && person.textContactHistory[i].activityID.toString() === activeActivityID.toString()){
                person.textContactHistory[i].textReceived = true;
                person.textContactHistory[i].textConv.push({origin: "VOTER", msg: message}) 
            }
        }
    
        person.save()
        return

    } catch(error){
        console.log(error)
    }
}

const updateConversation = async(person) =>{
    var updatedPerson = await Person.findOne({"_id": person._id})
    return updatedPerson
}

const idPerson = async(detail)=>{

    var person = await Person.findOne({"_id": detail.person._id});

    var idHistory = {scriptID: detail.script._id,
                     idBy: detail.userID,
                     idResponses: detail.idResponses,
                     locationIdentified: detail.location}

    if(person.textContactHistory.length === 0){

        var textContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        identified: true,
                                        complete: true,
                                        idHistory: idHistory
                                    }

        person.textContactHistory.push(textContactHistory)
        return person.save()

    }else{

        for (var i = 0; i < person.textContactHistory.length; i++){
            if(person.textContactHistory[i].activityID === detail.activityID){
                person.textContactHistory[i].idHistory.push(idHistory)
                person.textContactHistory[i].identified = true;
                person.textContactHistory[i].complete = true;
                person.textContactHistory[i].nonResponse = false;
                person.textContactHistory[i].refused = false;
                return person.save()
            }
        }

        var textContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        identified: true,
                                        complete: true,
                                        idHistory: idHistory
                                }

        person.textContactHistory.push(textContactHistory)
        return person.save()
    }
}

const nonResponse = async(detail)=>{
    console.log(detail)
    var person = await Person.findOne({"_id": detail.person._id});
    var refused = false;


    if(detail.idType === 'REFUSED'){refused = true;}

    if(person.textContactHistory.length === 0){

        var textContactHistory = {
                                        campaignID: detail.campaignID,
                                        activityID: detail.activityID,
                                        orgID: detail.orgID,
                                        refused: refused,
                                        nonResponse: true,
                                        identified: false,
                                        complete: true,
                                        idHistory: detail.idHistory
                                }

        person.textContactHistory.push(textContactHistory)
        return person.save()
    
    }else{
        for (var i = 0; i < person.textContactHistory.length; i++){
            if(person.textContactHistory[i].activityID === detail.activityID){
                person.textContactHistory[i].idHistory = detail.idHistory
                person.textContactHistory[i].identified = false;
                person.textContactHistory[i].complete = true;
                person.textContactHistory[i].nonResponse = true;
                person.textContactHistory[i].refused = refused;

                return person.save()
            }
        }

        var textContactHistory = {
                                    campaignID: detail.campaignID,
                                    activityID: detail.activityID,
                                    orgID: detail.orgID,
                                    refused: refused,
                                    complete: true,
                                    nonResponse: true,
                                    identified: false,
                                    idHistory: detail.idHistory
                                }
    
        person.textContactHistory.push(textContactHistory)
        return person.save()
    }
}

module.exports = {loadLockedPeople, 
                  getRespondedPeople, 
                  lockNewPeople, 
                  sendText, 
                  receiveTexts, 
                  updateConversation, 
                  idPerson,
                  nonResponse,
                  //getTextMetaData,
                  getIdentifiedPeople, 
                  allocatePhoneNumber,
                  resetTextBank,
                  getConversation
                }