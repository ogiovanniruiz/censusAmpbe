var Person = require('../models/people/person')

var twilio = require('twilio');
//var VoiceResponse = twilio.twiml.VoiceResponse;
//var ClientCapability = require('twilio').jwt.ClientCapability;

var phone_num = '+19513360702'

const accountSid = 'ACaa2284052d10b1610817013666b0ca9d';
const authToken = 'cb57765af76625d6ed79376cc411a2ca';

const client = require('twilio')(accountSid, authToken);

const  app_sid  = 'APcfa84370fade47d9de6493f08e73b6fa'

const loadLockedPeople = async(detail) =>{

    var people = await Person.find({"textContactHistory.activityID": detail.activityID,"textContactHistory.lockedBy": detail.userID}).limit(10).lean();
    
    for(var i = 0; i < people.length; i++){

        for(var j = 0; j < people[i].textContactHistory.length; j++){
            if(people[i].textContactHistory[j].textSent === true){
                //console.log(people[i])
                people.splice(i, 1)
                break;
            }
        } 
    }

    console.log(people)

    return people
}

const lockNewPeople = async(detail) =>{
    var people = await Person.find({"textContactHistory.activityID": {$ne: detail.activityID},"textContactHistory.lockedBy": {$ne: detail.userID}}).limit(10);

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
    //console.log(detail)


}

const sendText = async(detail) =>{

    //console.log(detail)

    var number = "9512580698"
    var script = detail.initTextMsg
  
    client.messages.create({
      body: script, 
      from: phone_num,
      to: '+1' + number
    }).then(message => {
            console.log(message.sid)
            return updatePerson(detail)
        }
  ).done(); 

  const updatePerson = async(detail) =>{
    try{
        var person = await Person.findOne({_id: detail.person._id});

        for(var i = 0; i < person.textContactHistory.length; i++){

            if(person.textContactHistory[i].activityID === detail.activityID){
                person.textContactHistory[i].textSent = true
                person.textContactHistory[i].textConv.push({origin: "VOLUNTEER", msg: detail.initTextMsg})
            }
        }

        console.log(person)

        return person.save()
    }catch(e){
        throw new Error(e.message)
    }
  }
}

module.exports = {loadLockedPeople, getRespondedPeople, lockNewPeople, sendText}