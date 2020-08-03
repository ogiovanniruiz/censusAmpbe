var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
var Target = require('../models/targets/target')
var Organization = require('../models/organizations/organization'); 

const resetTextBank = async(detail) =>{

    var people = await Person.find({"textContactHistory": { $elemMatch: {activityID: detail.activityID}}});
    var count = 0;
    
    for(var i = 0; i <  people.length; i++){
        //people[i].textable = '?'

        for(var j = 0; j < people[i].textContactHistory.length; j++){
            if(people[i].textContactHistory[j].activityID === detail.activityID){
                people[i].textContactHistory.splice(j,1)
                
            }
        }

        people[i].save()
    }

    return {count: count}
}

const lockNewPeople = async(detail) =>{
    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})

    var searchParameters = {
                            "textContactHistory": {$not: {$elemMatch: {activityID : detail.activityID}}},     
                            "preferredMethodContact": {$not: {$elemMatch: {method: "PHONE"}}, $not: {$elemMatch: {method: "EMAIL"}}},
                            "phones.0": {$exists: true, $ne: ""},
                            "textable": {$ne: "FALSE"},
                            "phones": {$not: {$regex: "-"}}, 
                            "address.blockgroupID": {$exists: true},
                            $nor: [{"phonebankContactHistory.idHistory.idResponses.responses": "Wrong Number"},
                                    {"phonebankContactHistory.idHistory.idResponses.responses": "wrong number"},
                                    {"phonebankContactHistory.idHistory.idResponses.responses": "Bad Number"},
                                    {"phonebankContactHistory.idHistory.idResponses.responses": "Disconnected"},
                                    {"phonebankContactHistory.idHistory.idResponses.responses": "Deceased"},
                                    {"phonebankContactHistory.idHistory.idResponses.responses": "Moved"},
                                    {"textContactHistory.idHistory.idResponses.responses": "Wrong Number"},
                                    ]
                            }

    var targetCoordinates = []
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
                    searchParameters['identified.locked'] = false
                    searchParameters['identified.finished'] = false
                }
                if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                    searchParameters['membership.orgID'] = targets[i].properties.queries[j].param
                }

                if(targets[i].properties.queries[j].queryType === "SCRIPT"){

                    if(targets[i].properties.queries[j].subParam === "NONRESPONSE"){

                        searchParameters['$and'] = [
                        
                            {"textContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID, campaignID: targets[i].properties.campaignID}}},
                            {"textContactHistory.textConv.1": {$exists: false}},
                            {"textContactHistory.textReceived": false},
                            {"textContactHistory.textSent": true},
                            //{"textContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                            //{"textContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                            {"textContactHistory.refused": {$ne: true}},
                           {"textContactHistory.identified": {$ne: true}}
             
                                ]

                    }else if (targets[i].properties.queries[j].subParam === "POSITIVE"){

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
                         ]},
                         
                 {$and: [{"textContactHistory": {$elemMatch: {orgID: targets[i].properties.orgID, campaignID: targets[i].properties.campaignID}}},
                         {"textContactHistory.idHistory.idResponses": {$elemMatch: {idType: targets[i].properties.queries[j].subParam}}},
                         {"textContactHistory.idHistory": {$elemMatch: {scriptID: targets[i].properties.queries[j].param}}},
                         {"textContactHistory.refused": {$ne: true}}
                         ]}        
                     ]

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

    console.log(searchParameters)

    var people = await Person.find(searchParameters).limit(5); 
    
    var textContactHistory = { 
                               campaignID: detail.campaignID,
                               activityID: detail.activityID,
                               lockedBy: detail.userID,
                               orgID: detail.orgID
                             }


    
    var scriptArray = ["5e6ab66a2a22d2001a04a1bb","5e7e8f2846de27001ac2beba", "5e6fca54ae6cdf001901b7c1"]
    for(var i = 0; i < people.length; i++){

        var duplicationError = false;

        for(var j = 0; j < people[i].textContactHistory.length; j++){
            if(people[i].textContactHistory[j].activityID === detail.activityID){
                duplicationError = true;
            }

            for(var k = 0; k < people[i].textContactHistory[j].idHistory.length; k++){
                if(scriptArray.includes(people[i].textContactHistory[j].idHistory[k].scriptID)){
                    if(people[i].textContactHistory[j].idHistory[k].idResponses[0].idType === "POSITIVE"){
                        duplicationError = true;
                    }
                }
            } 
        }
        if(!duplicationError){
            people[i].textContactHistory.push(textContactHistory)
            people[i].identified.locked = true;
            people[i].save()
        }else{
            var completedtextContactHistory = { 
                campaignID: detail.campaignID,
                activityID: detail.activityID,
                lockedBy: detail.userID,
                orgID: detail.orgID
              }
              people[i].textContactHistory.push(completedtextContactHistory)
              people[i].identified.locked = true;
              people[i].save()

        }
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

const loadLockedPeople = async(detail) =>{

    var people = await Person.find({"textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textSent: false }}, "textable": {$ne: "FALSE"}, "phones": {$not: {$regex: "-"}}}).limit(10); 
    return people
}

const getRespondedPeople = async(detail) =>{

    if(detail.orgLevel === "ADMINISTRATOR"){
        var people = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, textReceived: true, complete: false }}});
    }else{
        var people = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textReceived: true, complete: false }}});
    }
    
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

        for (var i = 0; i < person.textContactHistory.length; i++) {
            if(person.textContactHistory[i].activityID === detail.activityID){
                person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: error.message, error: error.message})
                person.textContactHistory[i].textSent = true
            }
        }
        return person.save()
    }
}

const receiveTexts = async(incoming) =>{

    var phoneNumber = incoming.From.substring(2);
    var message = incoming.Body;
    var outgoingPhoneNum = incoming.To;

    try{

        console.log(incoming)

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


    for (var i = 0; i < person.textContactHistory.length; i++){
        if(person.textContactHistory[i].activityID === detail.activityID){
            person.textContactHistory[i].idHistory.push(idHistory)
            person.textContactHistory[i].identified = true;
            person.textContactHistory[i].complete = true;
            person.textContactHistory[i].nonResponse = false;
            person.textContactHistory[i].refused = false;
            
        }
    }

    person['identified'].finished = true;

    return person.save()

    /*

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

    */
}

const nonResponse = async(detail)=>{
    console.log(detail)
    var person = await Person.findOne({"_id": detail.person._id});
    var refused = false;


    if(detail.idType === 'REFUSED'){refused = true;}

    for (var i = 0; i < person.textContactHistory.length; i++){
        if(person.textContactHistory[i].activityID === detail.activityID){
            person.textContactHistory[i].idHistory = detail.idHistory
            person.textContactHistory[i].identified = false;
            person.textContactHistory[i].complete = true;
            person.textContactHistory[i].nonResponse = true;
            person.textContactHistory[i].refused = refused;

        }
    }

    person['identified'].finished = true;

    return person.save()
}

const pullTexts = async(detail)=>{
    var org = await Organization.findOne({"_id": detail.orgID})

    if(org.twilioAccount.sid && org.twilioAccount.authToken){
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var numbers = await client.incomingPhoneNumbers.list({limit: 20}).then(incomingPhoneNumbers => {return incomingPhoneNumbers});

        for(var i = 0; i < numbers.length; i++){
            var messages = await client.messages.list({to: numbers[i].phoneNumber,}).then(messages => {return messages});


            var people = await Person.find({"textContactHistory.outgoingPhoneNum": numbers[i].phoneNumber, 
                                            "textContactHistory.textReceived": false,
                                            "textContactHistory.textConv.1": {$exists: false}})

            
            for(var j = 0; j < messages.length; j++){
                for(var k = 0; k < people.length; k++){
                    if(people[k].phones[0] === messages[j].from.substring(2)){
                        for(var l = 0; l < people[k].textContactHistory.length; l++){
                            if(people[k].textContactHistory[l].textConv.length === 1){
                                people[k].textContactHistory[l].textReceived = true;
                                people[k].textContactHistory[l].textConv.push({origin: "VOTER", msg: messages[j].body}) 
                            }
                        }
                        people[k].save()
                        break
                    }
                }
            }
        }

        return {msg: "Done."}
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
                  pullTexts,
                  //getTextMetaData,
                  getIdentifiedPeople, 
                  allocatePhoneNumber,
                  resetTextBank,
                  getConversation
                }