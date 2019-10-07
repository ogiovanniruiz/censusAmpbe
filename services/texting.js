var Person = require('../models/people/person')
var Target = require('../models/targets/target')

const lockNewPeople = async(detail) =>{
    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    var searchParameters = {$or: [{ "textContactHistory":  {$size: 0}, 
                                    "textContactHistory": { $not: {$elemMatch: {activityID : detail.activityID}}}}],
                            
                            "phones": { $exists: true, $not: {$size: 0}}
                            }

    for(var i = 0; i < targets.length; i++){
        if(targets[i].properties.params.targetType === "ORGMEMBERS"){
            searchParameters['membership'] = targets[i].properties.params.id
        
        }else if (targets[i].properties.params.targetType === "SCRIPT"){

            searchParameters['$or'] = [{'phonebankContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                            idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}}, 
                                       {'canvassContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                          idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}},
                                       {'textContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                       idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}}]
        }
    }

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

const getTextMetaData = async(detail) =>{

    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    var searchParametersTotal = {"phones": { $exists: true, $not: {$size: 0}}}

    for(var i = 0; i < targets.length; i++){
        if(targets[i].properties.params.targetType === "ORGMEMBERS"){
            searchParametersTotal['membership'] = targets[i].properties.params.id
        
        }else if (targets[i].properties.params.targetType === "SCRIPT"){

            searchParametersTotal['$or'] = [{'phonebankContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                            idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}}, 
                                       {'canvassContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                          idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}},
                                       {'textContactHistory': {$elemMatch: {"idHistory": {$elemMatch: {scriptID: targets[i].properties.params.id,
                                                                                                       idResponses: {$elemMatch: {idType: targets[i].properties.params.subParam}}}}}}}]
        }
    }

    var totalPeople = await Person.find(searchParametersTotal).count();

    const searchParametersSent = searchParametersTotal
    
    const searchParametersResponded = searchParametersTotal

    searchParametersSent["textContactHistory"] =  {$elemMatch: {textSent : true, activityID : detail.activityID}}

    var textsSent = await Person.find(searchParametersSent).count()

    searchParametersResponded["textContactHistory"] = {$elemMatch: {textReceived : true, activityID : detail.activityID}}

    var textsResponded = await Person.find(searchParametersResponded).count()

    return {total: totalPeople, textsSent: textsSent, textsResponded: textsResponded}

}

const loadLockedPeople = async(detail) =>{

    var people = await Person.find({ 
        "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textSent: false }}}).limit(10); 
    return people
}



const getRespondedPeople = async(detail) =>{

    var people = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textReceived: true, identified: false }}}).limit(5);   
    return people
}

const sendText = async(detail) =>{

    var number = detail.person.phones[0]
    var script = detail.initTextMsg

    var accountSid = process.env.accountSid;
    var authToken = process.env.authToken;

    const client = require('twilio')(accountSid, authToken);

    try {
        var person = await Person.findOne({_id: detail.person._id})

        client.messages.create({
                body: script, 
                from: detail.phoneNum,
                to: '+1' + number,
            }).then(message => {
                console.log(message)

            }).catch(e => { 
                console.error('Got an error:', e.code, e.message);    
                
                for (var i = 0; i < person.textContactHistory.length; i++) {
                    if(person.textContactHistory[i].activityID === detail.activityID){
                        person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: "STOPPED"})
                    }
                }

                person.save()

            }).done();

        for(var i = 0; i < person.textContactHistory.length; i++){
            if(person.textContactHistory[i].activityID === detail.activityID){
                person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: detail.initTextMsg})
                person.textContactHistory[i].outgoingPhoneNum = detail.phoneNum
                person.textContactHistory[i].textSent = true
            }
        }

        return person.save()
   
    } catch (error){
        console.log(error)
    }
}

const receiveTexts = async(incoming) =>{

    var phoneNumber = incoming.From.substring(2);
    var message = incoming.Body;
    var outgoingPhoneNum = incoming.To;

    try{
        var person = await Person.findOne({"phones": phoneNumber});  
        for(var i = 0; i < person.textContactHistory.length; i++){
            if(person.textContactHistory[i].outgoingPhoneNum === outgoingPhoneNum){
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

const finishIdentification = async(detail) => {
    var person = await Person.findOne({"_id": detail.person._id})

    for(var i = 0; i < person.textContactHistory.length; i++){

        if(person.textContactHistory[i].activityID === detail.activityID){
            person.textContactHistory[i].identified = true;
            return person.save()
        }
    }
    
}

module.exports = {loadLockedPeople, 
                  getRespondedPeople, 
                  lockNewPeople, 
                  sendText, 
                  receiveTexts, 
                  updateConversation, 
                  finishIdentification,
                  getTextMetaData}