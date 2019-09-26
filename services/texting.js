var Person = require('../models/people/person')
var Target = require('../models/targets/target')

//var phone_num = '+19513360702, +19514576907'

const accountSid = 'ACaa2284052d10b1610817013666b0ca9d';
const authToken = 'cb57765af76625d6ed79376cc411a2ca';

const client = require('twilio')(accountSid, authToken);

const loadLockedPeople = async(detail) =>{

    var people = await Person.find({ 
        "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textSent: false }}}).limit(10); 
    
    return people
    
}

const lockNewPeople = async(detail) =>{

    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    var searchParameters = {"textContactHistory": {$not:{ $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID}}}}

    for(var i = 0; i < targets.length; i++){
        if(targets[i].properties.params.targetType === "ORGMEMBERS"){
            searchParameters['membership'] = targets[i].properties.params.id
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
    
    return {msg: "success"}
    

}

const getRespondedPeople = async(detail) =>{

    var people = await Person.find({ "textContactHistory": { $elemMatch: {activityID: detail.activityID, lockedBy: detail.userID, textReceived: true, identified: false }}}).limit(5);   
    return people
}

const sendText = async(detail) =>{

    var number = detail.person.phones[0]
    var script = detail.initTextMsg

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

module.exports = {loadLockedPeople, getRespondedPeople, lockNewPeople, sendText, receiveTexts, updateConversation, finishIdentification}